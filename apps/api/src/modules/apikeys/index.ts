import type { FastifyPluginAsync } from 'fastify'
import crypto from 'node:crypto'
import { requireAuth } from '../../plugins/auth.js'

const apiKeysModule: FastifyPluginAsync = async (fastify) => {

  // POST /orgs/:orgId/api-keys — create API key
  fastify.post('/orgs/:orgId/api-keys', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string }
    const { label, scopes = [], expiresAt } = request.body as {
      label: string
      scopes?: string[]
      expiresAt?: string
    }
    const user = request.user!

    // Generate key: ghk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const rawKey = `ghk_live_${crypto.randomBytes(24).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

    const key = await fastify.prisma.orgApiKey.create({
      data: {
        orgId,
        keyHash,
        label,
        scopes,
        createdBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Return the raw key ONCE — never stored in plaintext
    return reply.status(201).send({ ...key, key: rawKey })
  })

  // GET /orgs/:orgId/api-keys — list keys (hashed only, never show raw)
  fastify.get('/orgs/:orgId/api-keys', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string }
    const keys = await fastify.prisma.orgApiKey.findMany({
      where: { orgId, revokedAt: null },
      select: { id: true, label: true, scopes: true, createdAt: true, lastUsedAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(keys)
  })

  // DELETE /api-keys/:id — revoke key
  fastify.delete('/api-keys/:id', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.orgApiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
    return reply.send({ success: true })
  })
}

export default apiKeysModule
