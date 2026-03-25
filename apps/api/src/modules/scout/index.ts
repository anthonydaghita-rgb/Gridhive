import type { FastifyPluginAsync } from 'fastify'
import crypto from 'node:crypto'
import { requireAuth } from '../../plugins/auth.js'

// Scout discovery API module
const scoutModule: FastifyPluginAsync = async (fastify) => {

  // POST /scout/discoveries — create a new discovery session
  fastify.post('/scout/discoveries', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { orgId, projectId, scanMode = 'standard' } = request.body as {
      orgId: string
      projectId?: string
      scanMode?: 'quick' | 'standard' | 'deep'
    }
    const user = request.user!

    // Generate pairing token: GHX-XXXX-XXXX-XXXX-XXXX format
    const tokenPart = () => Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0')
    const rawToken = `GHX-${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}`
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const discovery = await fastify.prisma.scoutDiscovery.create({
      data: {
        orgId,
        projectId: projectId || null,
        createdBy: user.id,
        pairingTokenHash: tokenHash,
        scanMode,
        status: 'pending',
        expiresAt,
      },
    })

    return reply.send({
      discoveryId: discovery.id,
      token: rawToken,
      expiresAt: discovery.expiresAt,
      wsUrl: `/scout/stream`,
    })
  })

  // GET /scout/discoveries/:id — get discovery status
  fastify.get('/scout/discoveries/:id', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const discovery = await fastify.prisma.scoutDiscovery.findUnique({
      where: { id },
    })
    if (!discovery) return reply.status(404).send({ error: 'Discovery not found' })
    return reply.send(discovery)
  })

  // GET /scout/discoveries/:id/topology — get partial topology built so far
  fastify.get('/scout/discoveries/:id/topology', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const discovery = await fastify.prisma.scoutDiscovery.findUnique({
      where: { id },
      select: { topologySnapshot: true, status: true, summary: true },
    })
    if (!discovery) return reply.status(404).send({ error: 'Discovery not found' })
    return reply.send({
      topology: discovery.topologySnapshot,
      status: discovery.status,
      summary: discovery.summary,
    })
  })

  // POST /scout/discoveries/:id/apply — finalize and apply to project
  fastify.post('/scout/discoveries/:id/apply', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { mergeMode = 'merge' } = request.body as { mergeMode?: 'merge' | 'replace' | 'new-layer' }
    const user = request.user!

    const discovery = await fastify.prisma.scoutDiscovery.findUnique({ where: { id } })
    if (!discovery) return reply.status(404).send({ error: 'Discovery not found' })
    if (discovery.status !== 'complete') return reply.status(400).send({ error: 'Discovery not complete' })

    await fastify.prisma.scoutDiscovery.update({
      where: { id },
      data: { appliedAt: new Date(), appliedBy: user.id },
    })

    return reply.send({ success: true, mergeMode })
  })

  // GET /scout/latest — Scout binary checks for updates
  fastify.get('/scout/latest', async (_request, reply) => {
    return reply.send({
      version: '1.0.0',
      downloadUrl: '/scout/download',
      releaseNotes: 'Initial release',
      requiredUpdate: false,
    })
  })

  // GET /scout/download — download links by OS
  fastify.get('/scout/download', async (_request, reply) => {
    return reply.send({
      windows: {
        filename: 'gridhive-scout-windows-amd64.exe',
        version: '1.0.0',
        sha256: 'placeholder-checksum',
        size: '~15MB',
      },
      macos: {
        filename: 'gridhive-scout-macos-arm64',
        version: '1.0.0',
        sha256: 'placeholder-checksum',
        size: '~14MB',
      },
      linux: {
        filename: 'gridhive-scout-linux-amd64',
        version: '1.0.0',
        sha256: 'placeholder-checksum',
        size: '~13MB',
      },
    })
  })
}

export default scoutModule
