import { FastifyPluginAsync } from 'fastify'
import { auth } from '../../lib/auth.js'
import { requireAuth } from '../../plugins/auth.js'

const authModule: FastifyPluginAsync = async (fastify) => {
  // Delegate all /auth/* requests to better-auth
  fastify.all('/*', async (request, reply) => {
    const url = new URL(request.url, `http://${request.hostname}`)
    const req = new Request(url.toString(), {
      method: request.method,
      headers: request.headers as Record<string, string>,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : JSON.stringify(request.body),
    })

    const response = await auth.handler(req)

    reply.status(response.status)
    response.headers.forEach((value, key) => {
      reply.header(key, value)
    })

    const body = await response.text()
    return reply.send(body)
  })

  // GET /auth/me - get current user
  fastify.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    return reply.send({ data: request.user })
  })
}

export default authModule
