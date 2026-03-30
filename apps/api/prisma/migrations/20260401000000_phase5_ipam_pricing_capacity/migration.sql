-- Phase 5: IPAM, Pricing/Proposals, Traffic Profiles

-- IPAM Namespaces
CREATE TABLE "ipam_namespaces" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ipam_namespaces_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ipam_namespaces_orgId_idx" ON "ipam_namespaces"("orgId");
ALTER TABLE "ipam_namespaces" ADD CONSTRAINT "ipam_namespaces_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- IPAM Supernets
CREATE TABLE "ipam_supernets" (
    "id" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ipam_supernets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ipam_supernets_namespaceId_idx" ON "ipam_supernets"("namespaceId");
ALTER TABLE "ipam_supernets" ADD CONSTRAINT "ipam_supernets_namespaceId_fkey"
    FOREIGN KEY ("namespaceId") REFERENCES "ipam_namespaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- IPAM Subnets
CREATE TABLE "ipam_subnets" (
    "id" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "supernetId" TEXT,
    "cidr" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vlanId" INTEGER,
    "vlanName" TEXT,
    "gatewayIp" TEXT,
    "dhcpServerIp" TEXT,
    "dnsServerIp" TEXT,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "associatedProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "utilizationPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ipam_subnets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ipam_subnets_namespaceId_idx" ON "ipam_subnets"("namespaceId");
ALTER TABLE "ipam_subnets" ADD CONSTRAINT "ipam_subnets_namespaceId_fkey"
    FOREIGN KEY ("namespaceId") REFERENCES "ipam_namespaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ipam_subnets" ADD CONSTRAINT "ipam_subnets_supernetId_fkey"
    FOREIGN KEY ("supernetId") REFERENCES "ipam_supernets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- IPAM Addresses
CREATE TABLE "ipam_addresses" (
    "id" TEXT NOT NULL,
    "subnetId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "hostname" TEXT,
    "macAddress" TEXT,
    "deviceType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "associatedProjectId" TEXT,
    "associatedNodeId" TEXT,
    "leaseType" TEXT NOT NULL DEFAULT 'static',
    "lastSeen" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ipam_addresses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ipam_addresses_subnetId_ipAddress_key" ON "ipam_addresses"("subnetId", "ipAddress");
CREATE INDEX "ipam_addresses_subnetId_idx" ON "ipam_addresses"("subnetId");
CREATE INDEX "ipam_addresses_ipAddress_idx" ON "ipam_addresses"("ipAddress");
ALTER TABLE "ipam_addresses" ADD CONSTRAINT "ipam_addresses_subnetId_fkey"
    FOREIGN KEY ("subnetId") REFERENCES "ipam_subnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Device Pricing
CREATE TABLE "device_pricing" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "msrp" DOUBLE PRECISION,
    "streetPrice" DOUBLE PRECISION,
    "pax8Price" DOUBLE PRECISION,
    "ingramPrice" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    CONSTRAINT "device_pricing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "device_pricing_vendorProfileId_key" ON "device_pricing"("vendorProfileId");
CREATE INDEX "device_pricing_vendorProfileId_idx" ON "device_pricing"("vendorProfileId");

-- Device Licensing
CREATE TABLE "device_licensing" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseDescription" TEXT NOT NULL,
    "annualCostUsd" DOUBLE PRECISION,
    "threeYearCostUsd" DOUBLE PRECISION,
    "notes" TEXT,
    CONSTRAINT "device_licensing_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "device_licensing_vendorProfileId_idx" ON "device_licensing"("vendorProfileId");

-- Org Proposal Settings
CREATE TABLE "org_proposal_settings" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "hardwareMarkupPct" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "laborRatePerHour" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "defaultTermsText" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_proposal_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "org_proposal_settings_orgId_key" ON "org_proposal_settings"("orgId");

-- Proposal Versions
CREATE TABLE "proposal_versions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposalData" JSONB NOT NULL DEFAULT '{}',
    "clientName" TEXT,
    "validThrough" TIMESTAMP(3),
    "proposalNumber" INTEGER NOT NULL,
    "totalHardware" DOUBLE PRECISION,
    "total3yr" DOUBLE PRECISION,
    CONSTRAINT "proposal_versions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "proposal_versions_projectId_idx" ON "proposal_versions"("projectId");
CREATE INDEX "proposal_versions_orgId_idx" ON "proposal_versions"("orgId");

-- Traffic Profiles
CREATE TABLE "traffic_profiles" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avgBandwidthMbps" DOUBLE PRECISION NOT NULL,
    "peakBandwidthMbps" DOUBLE PRECISION NOT NULL,
    "concurrencyFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "trafficType" TEXT NOT NULL,
    "burstDuration" TEXT NOT NULL DEFAULT 'continuous',
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "traffic_profiles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "traffic_profiles_orgId_idx" ON "traffic_profiles"("orgId");

-- Seed built-in traffic profiles
INSERT INTO "traffic_profiles" ("id", "name", "description", "avgBandwidthMbps", "peakBandwidthMbps", "concurrencyFactor", "trafficType", "burstDuration", "isBuiltin") VALUES
('tp-office-worker',    'Office Worker (General)',    'Browsing, email, SaaS apps',                 5,   50,  0.70, 'general-web',        'continuous'),
('tp-video-conf',       'Video Conference User',      'Zoom, Teams, WebEx (~3.5Mbps per call)',     4,   8,   0.40, 'video-conferencing', 'continuous'),
('tp-voip',             'VoIP Phone',                 'Voice calls, requires DSCP EF',              0.1, 0.15,0.30, 'voip',               'continuous'),
('tp-camera-1080',      'IP Camera (1080p H.264)',    'Continuous 1080p stream',                    3,   4,   1.00, 'video-surveillance', 'continuous'),
('tp-camera-4k',        'IP Camera (4K H.265)',       'Continuous 4K stream',                       8,   12,  1.00, 'video-surveillance', 'continuous'),
('tp-file-server',      'File Server Client',         'LAN file transfer (bursty)',                  10,  100, 0.20, 'file-server',        'short'),
('tp-backup',           'Backup Job (Large)',          'Nightly scheduled backup, off-hours burst',   0,   500, 0.10, 'backup',             'short'),
('tp-thin-client',      'Thin Client / RDP',          'Remote desktop session',                      2,   8,   0.80, 'remote-desktop',     'continuous'),
('tp-industrial',       'Industrial SCADA',            'Low bandwidth, high reliability required',   0.5, 1,   1.00, 'industrial-scada',   'continuous');
