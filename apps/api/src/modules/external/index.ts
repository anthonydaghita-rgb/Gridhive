import type { FastifyPluginAsync } from 'fastify'
import crypto from 'node:crypto'

const externalApiModule: FastifyPluginAsync = async (fastify) => {

  // Middleware: validate API key
  const requireApiKey = async (request: any, reply: any) => {
    const apiKey = request.headers['x-api-key'] as string | undefined
    if (!apiKey) return reply.status(401).send({ error: 'API key required' })

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const key = await fastify.prisma.orgApiKey.findFirst({
      where: { keyHash, revokedAt: null },
    })
    if (!key) return reply.status(401).send({ error: 'Invalid API key' })
    if (key.expiresAt && key.expiresAt < new Date()) return reply.status(401).send({ error: 'API key expired' })

    // Update last used
    await fastify.prisma.orgApiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    request.apiKey = key
  }

  // GET /api/v1/projects
  fastify.get('/api/v1/projects', { preHandler: [requireApiKey] }, async (request, reply) => {
    const key = (request as any).apiKey
    const projects = await fastify.prisma.project.findMany({
      where: { orgId: key.orgId, archived: false },
      orderBy: { updatedAt: 'desc' },
    })
    return reply.send({ data: projects })
  })

  // GET /api/v1/projects/:id
  fastify.get('/api/v1/projects/:id', { preHandler: [requireApiKey] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const key = (request as any).apiKey
    const project = await fastify.prisma.project.findFirst({
      where: { id, orgId: key.orgId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    })
    if (!project) return reply.status(404).send({ error: 'Project not found' })
    return reply.send({ data: project })
  })

  // POST /api/v1/projects/:id/validate
  fastify.post('/api/v1/projects/:id/validate', { preHandler: [requireApiKey] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const key = (request as any).apiKey
    const project = await fastify.prisma.project.findFirst({
      where: { id, orgId: key.orgId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    })
    if (!project) return reply.status(404).send({ error: 'Project not found' })
    // Return a stub for now — actual validation requires full engine
    return reply.send({ data: { projectId: id, message: 'Validation triggered via API' } })
  })

  // POST /api/v1/scout/discoveries
  fastify.post('/api/v1/scout/discoveries', { preHandler: [requireApiKey] }, async (request, reply) => {
    const key = (request as any).apiKey
    const { projectId, scanMode = 'standard' } = request.body as { projectId?: string; scanMode?: string }

    const tokenPart = () => Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0')
    const rawToken = `GHX-${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}`
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const discovery = await fastify.prisma.scoutDiscovery.create({
      data: {
        orgId: key.orgId,
        projectId: projectId || null,
        createdBy: key.createdBy,
        pairingTokenHash: tokenHash,
        scanMode,
        status: 'pending',
        expiresAt,
      },
    })

    return reply.send({
      data: {
        discoveryId: discovery.id,
        token: rawToken,
        expiresAt: discovery.expiresAt,
      },
    })
  })

  // GET /api/v1/templates
  fastify.get('/api/v1/templates', { preHandler: [requireApiKey] }, async (_request, reply) => {
    const templates = await fastify.prisma.template.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, slug: true, category: true, tags: true, difficulty: true },
    })
    return reply.send({ data: templates })
  })
}

export default externalApiModule
