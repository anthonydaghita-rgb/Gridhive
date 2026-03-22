import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
})

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const SaveVersionSchema = z.object({
  label: z.string().optional(),
  topology: TopologySnapshotSchema,
  isAutosave: z.boolean().optional(),
})

const projectsModule: FastifyPluginAsync = async (fastify) => {
  // POST /orgs
  fastify.post('/orgs', { preHandler: requireAuth }, async (request, reply) => {
    const body = CreateOrgSchema.parse(request.body)

    const existing = await fastify.prisma.organization.findUnique({
      where: { slug: body.slug },
    })

    if (existing) {
      return reply.status(409).send({ error: 'Conflict', message: 'Slug already taken' })
    }

    const org = await fastify.prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
        members: {
          create: {
            userId: request.user!.id,
            role: 'owner',
          },
        },
      },
    })

    return reply.status(201).send({ data: org })
  })

  // GET /orgs/:id
  fastify.get('/orgs/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const org = await fastify.prisma.organization.findFirst({
      where: {
        id,
        members: { some: { userId: request.user!.id } },
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    })

    if (!org) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: org })
  })

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
    })

    return reply.send({ data: projects })
  })

  // GET /projects/:id
  fastify.get('/projects/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const project = await fastify.prisma.project.findFirst({
      where: {
        id,
        org: { members: { some: { userId: request.user!.id } } },
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    })

    if (!project) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: project })
  })

  // POST /projects/:id/versions
  fastify.post('/projects/:id/versions', { preHandler: requireAuth }, async (request, reply) => {
    const { id: projectId } = request.params as { id: string }
    const body = SaveVersionSchema.parse(request.body)

    const project = await fastify.prisma.project.findFirst({
      where: {
        id: projectId,
        org: { members: { some: { userId: request.user!.id } } },
      },
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
      where: {
        id: projectId,
        org: { members: { some: { userId: request.user!.id } } },
      },
    })

    if (!project) return reply.status(404).send({ error: 'Not Found' })

    const versions = await fastify.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        label: true,
        createdAt: true,
        isAutosave: true,
        createdBy: true,
      },
    })

    return reply.send({ data: versions })
  })
}

export default projectsModule
