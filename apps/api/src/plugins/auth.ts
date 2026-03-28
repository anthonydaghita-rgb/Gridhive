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
    const cookieToken = request.cookies['better-auth.session_token']
    const bearerToken = request.headers.authorization?.replace('Bearer ', '')
    const sessionToken = cookieToken || bearerToken

    if (!sessionToken) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'No session token' })
    }

    // If the token arrived as a Bearer header (cross-origin), inject it as the
    // cookie header so better-auth's getSession can validate it correctly.
    const headersForSession: Record<string, string> = { ...(request.headers as Record<string, string>) }
    if (!cookieToken && bearerToken) {
      const existingCookie = headersForSession['cookie'] || ''
      headersForSession['cookie'] = existingCookie
        ? `${existingCookie}; better-auth.session_token=${bearerToken}`
        : `better-auth.session_token=${bearerToken}`
    }

    const session = await auth.api.getSession({
      headers: headersForSession,
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
