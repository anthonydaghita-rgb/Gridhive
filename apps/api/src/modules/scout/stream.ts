import type { FastifyPluginAsync } from 'fastify'
import crypto from 'node:crypto'
import { requireAuth } from '../../plugins/auth.js'

// TODO: WebSocket streaming support requires @fastify/websocket.
// Install with: pnpm add @fastify/websocket
// Then replace this module with the full WebSocket implementation using:
//
//   import websocket from '@fastify/websocket'
//   import type { WebSocket } from '@fastify/websocket'
//
//   await fastify.register(websocket)
//
//   // In-memory map of active discovery sessions: discoveryId -> Set<WebSocket>
//   const activeConnections = new Map<string, Set<WebSocket>>()
//   // In-memory map of partial topology data being built during scan
//   const partialTopologies = new Map<string, { nodes: unknown[]; edges: unknown[]; vlans: unknown[] }>()
//
//   // Scout binary WS endpoint:
//   fastify.get('/scout/stream', { websocket: true }, async (socket, request) => { ... })
//
//   // Browser watch WS endpoint:
//   fastify.get('/scout/watch/:discoveryId', { websocket: true }, async (socket, request) => { ... })

export const scoutStreamModule: FastifyPluginAsync = async (fastify) => {

  // POST /scout/stream/connect — Scout binary registers itself (HTTP fallback for WS handshake)
  // This endpoint validates the pairing token and marks the discovery as scanning.
  // Replace with WebSocket endpoint once @fastify/websocket is installed.
  fastify.post('/scout/stream/connect', async (request, reply) => {
    const rawToken = (request.query as Record<string, string>).token ||
      request.headers.authorization?.replace('Bearer ', '')

    if (!rawToken) {
      return reply.status(401).send({ error: 'Missing token' })
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const discovery = await fastify.prisma.scoutDiscovery.findFirst({
      where: { pairingTokenHash: tokenHash, status: 'pending' },
    })

    if (!discovery || (discovery.expiresAt && discovery.expiresAt < new Date())) {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }

    await fastify.prisma.scoutDiscovery.update({
      where: { id: discovery.id },
      data: { status: 'scanning', startedAt: new Date() },
    })

    return reply.send({ discoveryId: discovery.id, status: 'scanning' })
  })

  // POST /scout/stream/event — Scout binary streams discovery events (HTTP fallback)
  // Replace with WebSocket message handler once @fastify/websocket is installed.
  fastify.post('/scout/stream/event', async (request, reply) => {
    const rawToken = (request.query as Record<string, string>).token ||
      request.headers.authorization?.replace('Bearer ', '')

    if (!rawToken) {
      return reply.status(401).send({ error: 'Missing token' })
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const discovery = await fastify.prisma.scoutDiscovery.findFirst({
      where: { pairingTokenHash: tokenHash, status: 'scanning' },
    })

    if (!discovery) {
      return reply.status(401).send({ error: 'No active scanning session for this token' })
    }

    const message = request.body as {
      type: 'device' | 'connection' | 'vlan' | 'complete'
      data: unknown
    }

    if (message.type === 'complete') {
      const completeData = message.data as {
        summary?: unknown
        nodes?: unknown[]
        edges?: unknown[]
        vlans?: unknown[]
      }
      await fastify.prisma.scoutDiscovery.update({
        where: { id: discovery.id },
        data: {
          status: 'complete',
          completedAt: new Date(),
          summary: completeData.summary as object | undefined,
          topologySnapshot: {
            nodes: completeData.nodes ?? [],
            edges: completeData.edges ?? [],
            vlans: completeData.vlans ?? [],
          },
        },
      })
    }

    return reply.send({ ok: true })
  })

  // GET /scout/watch/:discoveryId — browser polls current partial topology (HTTP fallback)
  // Replace with WebSocket endpoint once @fastify/websocket is installed.
  fastify.get('/scout/watch/:discoveryId', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { discoveryId } = request.params as { discoveryId: string }

    const discovery = await fastify.prisma.scoutDiscovery.findUnique({
      where: { id: discoveryId },
      select: { id: true, status: true, topologySnapshot: true, summary: true },
    })

    if (!discovery) return reply.status(404).send({ error: 'Discovery not found' })

    return reply.send({
      type: 'partial-topology',
      data: discovery.topologySnapshot ?? { nodes: [], edges: [], vlans: [] },
      status: discovery.status,
    })
  })
}
