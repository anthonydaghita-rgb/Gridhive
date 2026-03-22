import { FastifyPluginAsync } from 'fastify'
import multipart from '@fastify/multipart'
import { requireAuth } from '../../plugins/auth.js'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
})

const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  contactEmail: z.string().email().optional(),
})

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  folderId: z.string().optional(),
})

const UpdateProjectSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().nullable().optional(),
  defaultIpRange: z.string().optional(),
  canvasTheme: z.string().optional(),
  snapToGrid: z.boolean().optional(),
  gridSize: z.number().optional(),
})

const SaveVersionSchema = z.object({
  label: z.string().optional(),
  topology: TopologySnapshotSchema,
  isAutosave: z.boolean().optional(),
  thumbnailBase64: z.string().optional(),
})

const CreateFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
})

const UpdateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
})

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
})

const UpdateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
})

const projectsModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart, {
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max for logos
  })

  // ─── ORG ENDPOINTS ───────────────────────────────────────────────────────────

  // GET /orgs — list orgs for current user
  fastify.get('/orgs', { preHandler: requireAuth }, async (request, reply) => {
    const memberships = await fastify.prisma.orgMember.findMany({
      where: { userId: request.user!.id },
      include: { org: true },
      orderBy: { joinedAt: 'asc' },
    })
    return reply.send({ data: memberships.map((m: { org: unknown }) => m.org) })
  })

  // POST /orgs
  fastify.post('/orgs', { preHandler: requireAuth }, async (request, reply) => {
    const body = CreateOrgSchema.parse(request.body)

    const existing = await fastify.prisma.organization.findUnique({ where: { slug: body.slug } })
    if (existing) return reply.status(409).send({ error: 'Conflict', message: 'Slug already taken' })

    const org = await fastify.prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
        members: { create: { userId: request.user!.id, role: 'owner' } },
      },
    })

    return reply.status(201).send({ data: org })
  })

  // GET /orgs/:id
  fastify.get('/orgs/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const org = await fastify.prisma.organization.findFirst({
      where: { id, members: { some: { userId: request.user!.id } } },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    })

    if (!org) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: org })
  })

  // PUT /orgs/:id
  fastify.put('/orgs/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = UpdateOrgSchema.parse(request.body)

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: request.user!.id } },
    })
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    const org = await fastify.prisma.organization.update({
      where: { id },
      data: body,
    })

    return reply.send({ data: org })
  })

  // POST /orgs/:id/logo — upload logo as base64
  fastify.post('/orgs/:id/logo', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: request.user!.id } },
    })
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'No file provided' })

    const mime = data.mimetype
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(mime)) {
      return reply.status(400).send({ error: 'Only PNG, JPG, and SVG files are accepted' })
    }

    const chunks: Buffer[] = []
    for await (const chunk of data.file) chunks.push(chunk)
    const base64 = `data:${mime};base64,${Buffer.concat(chunks).toString('base64')}`

    const org = await fastify.prisma.organization.update({
      where: { id },
      data: { logoBase64: base64 },
    })

    return reply.send({ data: { logoBase64: org.logoBase64 } })
  })

  // DELETE /orgs/:id/logo
  fastify.delete('/orgs/:id/logo', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: request.user!.id } },
    })
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    await fastify.prisma.organization.update({ where: { id }, data: { logoBase64: null } })
    return reply.send({ success: true })
  })

  // ─── ORG MEMBER ENDPOINTS ────────────────────────────────────────────────────

  // GET /orgs/:id/members
  fastify.get('/orgs/:id/members', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const members = await fastify.prisma.orgMember.findMany({
      where: { orgId },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { joinedAt: 'asc' },
    })

    return reply.send({ data: members })
  })

  // POST /orgs/:id/members/invite — stub invite
  fastify.post('/orgs/:id/members/invite', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }
    const body = InviteMemberSchema.parse(request.body)

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    // Phase 2: stub — log invite, check if user exists and add them
    const existingUser = await fastify.prisma.user.findUnique({ where: { email: body.email } })
    if (existingUser) {
      const alreadyMember = await fastify.prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId, userId: existingUser.id } },
      })
      if (alreadyMember) {
        return reply.status(409).send({ error: 'User is already a member of this organization' })
      }
      const newMember = await fastify.prisma.orgMember.create({
        data: { orgId, userId: existingUser.id, role: body.role },
      })
      return reply.status(201).send({ data: newMember, invited: true })
    }

    // User not found — stub pending invite
    fastify.log.info(`[INVITE STUB] Invite to ${body.email} for org ${orgId} with role ${body.role}`)
    return reply.status(201).send({ data: { email: body.email, role: body.role, pending: true } })
  })

  // PATCH /orgs/:id/members/:userId
  fastify.patch('/orgs/:id/members/:userId', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId, userId } = request.params as { id: string; userId: string }
    const body = UpdateMemberRoleSchema.parse(request.body)

    const requestingMember = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!requestingMember || !['owner', 'admin'].includes(requestingMember.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    // Cannot change owner role
    const targetMember = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })
    if (!targetMember) return reply.status(404).send({ error: 'Member not found' })
    if (targetMember.role === 'owner') return reply.status(403).send({ error: 'Cannot change owner role' })

    const updated = await fastify.prisma.orgMember.update({
      where: { orgId_userId: { orgId, userId } },
      data: { role: body.role },
    })

    return reply.send({ data: updated })
  })

  // DELETE /orgs/:id/members/:userId
  fastify.delete('/orgs/:id/members/:userId', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId, userId } = request.params as { id: string; userId: string }

    const requestingMember = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!requestingMember || !['owner', 'admin'].includes(requestingMember.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }

    const targetMember = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })
    if (!targetMember) return reply.status(404).send({ error: 'Member not found' })
    if (targetMember.role === 'owner') return reply.status(403).send({ error: 'Cannot remove the org owner' })

    await fastify.prisma.orgMember.delete({ where: { orgId_userId: { orgId, userId } } })
    return reply.send({ success: true })
  })

  // ─── FOLDER ENDPOINTS ────────────────────────────────────────────────────────

  // GET /orgs/:id/folders
  fastify.get('/orgs/:id/folders', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const folders = await fastify.prisma.folder.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { projects: true } } },
    })

    return reply.send({ data: folders })
  })

  // POST /orgs/:id/folders
  fastify.post('/orgs/:id/folders', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }
    const body = CreateFolderSchema.parse(request.body)

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const folder = await fastify.prisma.folder.create({
      data: { orgId, ...body, createdBy: request.user!.id },
    })

    return reply.status(201).send({ data: folder })
  })

  // PUT /folders/:id
  fastify.put('/folders/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = UpdateFolderSchema.parse(request.body)

    const folder = await fastify.prisma.folder.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!folder) return reply.status(404).send({ error: 'Not Found' })

    const updated = await fastify.prisma.folder.update({ where: { id }, data: body })
    return reply.send({ data: updated })
  })

  // DELETE /folders/:id
  fastify.delete('/folders/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const folder = await fastify.prisma.folder.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!folder) return reply.status(404).send({ error: 'Not Found' })

    // Unfile all projects in this folder first
    await fastify.prisma.project.updateMany({ where: { folderId: id }, data: { folderId: null } })
    await fastify.prisma.folder.delete({ where: { id } })

    return reply.send({ success: true })
  })

  // GET /folders/:id/projects
  fastify.get('/folders/:id/projects', { preHandler: requireAuth }, async (request, reply) => {
    const { id: folderId } = request.params as { id: string }

    const folder = await fastify.prisma.folder.findFirst({
      where: { id: folderId, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!folder) return reply.status(404).send({ error: 'Not Found' })

    const projects = await fastify.prisma.project.findMany({
      where: { folderId, archived: false },
      orderBy: { updatedAt: 'desc' },
    })

    return reply.send({ data: projects })
  })

  // ─── PROJECT ENDPOINTS ───────────────────────────────────────────────────────

  // POST /orgs/:id/projects
  fastify.post('/orgs/:id/projects', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }
    const body = CreateProjectSchema.parse(request.body)

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const project = await fastify.prisma.project.create({
      data: {
        orgId,
        name: body.name,
        description: body.description,
        folderId: body.folderId,
        createdBy: request.user!.id,
      },
    })

    return reply.status(201).send({ data: project })
  })

  // GET /orgs/:id/projects
  fastify.get('/orgs/:id/projects', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const projects = await fastify.prisma.project.findMany({
      where: { orgId, archived: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        folder: { select: { id: true, name: true, color: true } },
        creator: { select: { id: true, name: true } },
        versions: { orderBy: { versionNumber: 'desc' }, take: 1, select: { thumbnailBase64: true, versionNumber: true } },
      },
    })

    return reply.send({ data: projects })
  })

  // GET /orgs/:id/projects/trash
  fastify.get('/orgs/:id/projects/trash', { preHandler: requireAuth }, async (request, reply) => {
    const { id: orgId } = request.params as { id: string }

    const member = await fastify.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: request.user!.id } },
    })
    if (!member) return reply.status(403).send({ error: 'Forbidden' })

    const projects = await fastify.prisma.project.findMany({
      where: { orgId, archived: true },
      orderBy: { archivedAt: 'desc' },
    })

    return reply.send({ data: projects })
  })

  // GET /projects/:id
  fastify.get('/projects/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
      include: {
        folder: { select: { id: true, name: true, color: true } },
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    })

    if (!project) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: project })
  })

  // GET /projects/:id/settings
  fastify.get('/projects/:id/settings', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
      select: {
        id: true, name: true, description: true, clientName: true, tags: true,
        folderId: true, defaultIpRange: true, canvasTheme: true, snapToGrid: true, gridSize: true,
        folder: { select: { id: true, name: true } },
      },
    })

    if (!project) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: project })
  })

  // PUT /projects/:id/settings
  fastify.put('/projects/:id/settings', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = UpdateProjectSettingsSchema.parse(request.body)

    const project = await fastify.prisma.project.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const updated = await fastify.prisma.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.clientName !== undefined && { clientName: body.clientName }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.folderId !== undefined && { folderId: body.folderId }),
        ...(body.defaultIpRange !== undefined && { defaultIpRange: body.defaultIpRange }),
        ...(body.canvasTheme !== undefined && { canvasTheme: body.canvasTheme }),
        ...(body.snapToGrid !== undefined && { snapToGrid: body.snapToGrid }),
        ...(body.gridSize !== undefined && { gridSize: body.gridSize }),
      },
    })

    return reply.send({ data: updated })
  })

  // DELETE /projects/:id — soft delete
  fastify.delete('/projects/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    await fastify.prisma.project.update({
      where: { id },
      data: { archived: true, archivedAt: new Date(), archivedBy: request.user!.id },
    })

    return reply.send({ success: true })
  })

  // DELETE /projects/:id/permanent — hard delete from trash
  fastify.delete('/projects/:id/permanent', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id, archived: true, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    await fastify.prisma.project.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // POST /projects/:id/duplicate
  fastify.post('/projects/:id/duplicate', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id, org: { members: { some: { userId: request.user!.id } } } },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const newProject = await fastify.prisma.project.create({
      data: {
        orgId: project.orgId,
        folderId: project.folderId,
        name: `${project.name} — Copy`,
        description: project.description,
        clientName: project.clientName,
        tags: project.tags,
        defaultIpRange: project.defaultIpRange,
        canvasTheme: project.canvasTheme,
        snapToGrid: project.snapToGrid,
        gridSize: project.gridSize,
        createdBy: request.user!.id,
      },
    })

    // Copy latest version if exists
    if (project.versions.length > 0) {
      const latest = project.versions[0]
      await fastify.prisma.projectVersion.create({
        data: {
          projectId: newProject.id,
          versionNumber: 1,
          label: 'Initial (duplicated)',
          topology: latest.topology as object,
          createdBy: request.user!.id,
          isAutosave: false,
        },
      })
    }

    return reply.status(201).send({ data: newProject })
  })

  // POST /projects/:id/versions
  fastify.post('/projects/:id/versions', { preHandler: requireAuth }, async (request, reply) => {
    const { id: projectId } = request.params as { id: string }
    const body = SaveVersionSchema.parse(request.body)

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const lastVersion = await fastify.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    })

    const versionNumber = (lastVersion?.versionNumber ?? 0) + 1

    const version = await fastify.prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber,
        label: body.label,
        topology: body.topology as object,
        thumbnailBase64: body.thumbnailBase64,
        createdBy: request.user!.id,
        isAutosave: body.isAutosave ?? false,
      },
    })

    await fastify.prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    })

    return reply.status(201).send({ data: version })
  })

  // GET /projects/:id/versions
  fastify.get('/projects/:id/versions', { preHandler: requireAuth }, async (request, reply) => {
    const { id: projectId } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const versions = await fastify.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
      take: 20,
      select: {
        id: true, versionNumber: true, label: true, createdAt: true,
        isAutosave: true, createdBy: true, thumbnailBase64: true,
        creator: { select: { name: true } },
      },
    })

    return reply.send({ data: versions })
  })

  // PUT /projects/:id/versions/:versionId/restore
  fastify.put('/projects/:id/versions/:versionId/restore', { preHandler: requireAuth }, async (request, reply) => {
    const { id: projectId, versionId } = request.params as { id: string; versionId: string }

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, org: { members: { some: { userId: request.user!.id } } } },
    })
    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const version = await fastify.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
    })
    if (!version) return reply.status(404).send({ error: 'Version not found' })

    // Create a new version from the restored snapshot
    const lastVersion = await fastify.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    })

    const newVersion = await fastify.prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        label: `Restored from v${version.versionNumber}`,
        topology: version.topology as object,
        createdBy: request.user!.id,
        isAutosave: false,
      },
    })

    await fastify.prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } })
    return reply.send({ data: newVersion })
  })
}

export default projectsModule
