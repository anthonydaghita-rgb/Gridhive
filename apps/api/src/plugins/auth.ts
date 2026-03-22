import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '../lib/auth.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      name: string
    }
    session?: {
      userId: string
      token: string
    }
  }
}

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const sessionToken = request.cookies['better-auth.session_token'] ||
                         request.headers.authorization?.replace('Bearer ', '')

    if (!sessionToken) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'No session token' })
    }

    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>,
    })

    if (!session?.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid session' })
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    }
    request.session = {
      userId: session.user.id,
      token: sessionToken,
    }
  } catch {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Session validation failed' })
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('requireAuth', requireAuth)
}

export default authPlugin
