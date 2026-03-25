-- Phase 4 Migration: Scout, Monitoring, Favorites, API Keys, Comments
-- Run with: psql -U postgres gridhive < migration.sql

-- Add ipAddress to audit_logs
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

-- ─────────────────────────────────────────────────────────────
-- Migration 1: Project Management
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "project_search_index" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hostname" TEXT,
    "ipAddress" TEXT,
    "deviceType" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_search_index_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_project_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_project_favorites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_project_favorites_userId_projectId_key" UNIQUE ("userId", "projectId")
);

CREATE TABLE IF NOT EXISTS "project_comments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nodeId" TEXT,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "project_search_index_projectId_idx" ON "project_search_index"("projectId");
CREATE INDEX IF NOT EXISTS "project_search_index_hostname_idx" ON "project_search_index"("hostname");
CREATE INDEX IF NOT EXISTS "project_search_index_ipAddress_idx" ON "project_search_index"("ipAddress");
CREATE INDEX IF NOT EXISTS "project_comments_projectId_idx" ON "project_comments"("projectId");

ALTER TABLE "project_search_index" ADD CONSTRAINT IF NOT EXISTS "project_search_index_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "user_project_favorites" ADD CONSTRAINT IF NOT EXISTS "user_project_favorites_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_project_favorites" ADD CONSTRAINT IF NOT EXISTS "user_project_favorites_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "project_comments" ADD CONSTRAINT IF NOT EXISTS "project_comments_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "project_comments" ADD CONSTRAINT IF NOT EXISTS "project_comments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id");

-- ─────────────────────────────────────────────────────────────
-- Migration 2: Scout Discoveries
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "scout_discoveries" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdBy" TEXT NOT NULL,
    "pairingTokenHash" TEXT NOT NULL,
    "scanMode" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "summary" JSONB,
    "topologySnapshot" JSONB,
    "appliedAt" TIMESTAMP(3),
    "appliedBy" TEXT,
    "scoutVersion" TEXT,
    "hostOs" TEXT,
    "hostIp" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scout_discoveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "scout_discoveries_orgId_idx" ON "scout_discoveries"("orgId");
CREATE INDEX IF NOT EXISTS "scout_discoveries_status_idx" ON "scout_discoveries"("status");

ALTER TABLE "scout_discoveries" ADD CONSTRAINT IF NOT EXISTS "scout_discoveries_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "scout_discoveries" ADD CONSTRAINT IF NOT EXISTS "scout_discoveries_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id");
ALTER TABLE "scout_discoveries" ADD CONSTRAINT IF NOT EXISTS "scout_discoveries_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id");

-- ─────────────────────────────────────────────────────────────
-- Migration 3: API Credentials (Live Push)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "org_api_credentials" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "credentialType" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3),
    "testResult" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_api_credentials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "org_api_credentials_orgId_vendor_idx" ON "org_api_credentials"("orgId", "vendor");

ALTER TABLE "org_api_credentials" ADD CONSTRAINT IF NOT EXISTS "org_api_credentials_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "org_api_credentials" ADD CONSTRAINT IF NOT EXISTS "org_api_credentials_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id");

-- ─────────────────────────────────────────────────────────────
-- Migration 4: Monitoring
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "monitoring_snapshots" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "polledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "uptimeSeconds" INTEGER,
    "cpuPct" DOUBLE PRECISION,
    "memoryPct" DOUBLE PRECISION,
    "data" JSONB,
    CONSTRAINT "monitoring_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monitoring_alert_rules" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deviceId" TEXT,
    "ruleType" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "notifyEmails" TEXT[] NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "monitoring_alert_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "monitoring_alert_events" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "summary" TEXT NOT NULL,
    CONSTRAINT "monitoring_alert_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "monitoring_snapshots_projectId_deviceId_idx" ON "monitoring_snapshots"("projectId", "deviceId");
CREATE INDEX IF NOT EXISTS "monitoring_snapshots_polledAt_idx" ON "monitoring_snapshots"("polledAt");
CREATE INDEX IF NOT EXISTS "monitoring_alert_rules_projectId_idx" ON "monitoring_alert_rules"("projectId");
CREATE INDEX IF NOT EXISTS "monitoring_alert_events_projectId_idx" ON "monitoring_alert_events"("projectId");

ALTER TABLE "monitoring_snapshots" ADD CONSTRAINT IF NOT EXISTS "monitoring_snapshots_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "monitoring_alert_rules" ADD CONSTRAINT IF NOT EXISTS "monitoring_alert_rules_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "monitoring_alert_rules" ADD CONSTRAINT IF NOT EXISTS "monitoring_alert_rules_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id");
ALTER TABLE "monitoring_alert_events" ADD CONSTRAINT IF NOT EXISTS "monitoring_alert_events_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "monitoring_alert_events" ADD CONSTRAINT IF NOT EXISTS "monitoring_alert_events_ruleId_fkey"
    FOREIGN KEY ("ruleId") REFERENCES "monitoring_alert_rules"("id") ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- Migration 5: External API Access
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "org_api_keys" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scopes" TEXT[] NOT NULL DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_api_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "org_api_keys_keyHash_key" UNIQUE ("keyHash")
);

CREATE TABLE IF NOT EXISTS "org_webhooks" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] NOT NULL DEFAULT '{}',
    "secretHash" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "org_api_keys_orgId_idx" ON "org_api_keys"("orgId");
CREATE INDEX IF NOT EXISTS "org_webhooks_orgId_idx" ON "org_webhooks"("orgId");

ALTER TABLE "org_api_keys" ADD CONSTRAINT IF NOT EXISTS "org_api_keys_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "org_api_keys" ADD CONSTRAINT IF NOT EXISTS "org_api_keys_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id");
ALTER TABLE "org_webhooks" ADD CONSTRAINT IF NOT EXISTS "org_webhooks_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "org_webhooks" ADD CONSTRAINT IF NOT EXISTS "org_webhooks_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id");

-- ─────────────────────────────────────────────────────────────
-- Migration 6: Collaboration Locks
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "project_node_locks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_node_locks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "project_node_locks_projectId_nodeId_key" UNIQUE ("projectId", "nodeId")
);

ALTER TABLE "project_node_locks" ADD CONSTRAINT IF NOT EXISTS "project_node_locks_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE "project_node_locks" ADD CONSTRAINT IF NOT EXISTS "project_node_locks_lockedBy_fkey"
    FOREIGN KEY ("lockedBy") REFERENCES "users"("id");
