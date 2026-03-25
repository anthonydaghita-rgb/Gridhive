import type { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'

const favoritesModule: FastifyPluginAsync = async (fastify) => {

  // POST /projects/:id/favorite
  fastify.post('/projects/:id/favorite', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user!

    await fastify.prisma.userProjectFavorite.upsert({
      where: { userId_projectId: { userId: user.id, projectId: id } },
      create: { userId: user.id, projectId: id },
      update: {},
    })
    return reply.send({ success: true })
  })

  // DELETE /projects/:id/favorite
  fastify.delete('/projects/:id/favorite', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user!

    await fastify.prisma.userProjectFavorite.deleteMany({
      where: { userId: user.id, projectId: id },
    })
    return reply.send({ success: true })
  })

  // GET /users/me/favorites
  fastify.get('/users/me/favorites', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const user = request.user!
    const favorites = await fastify.prisma.userProjectFavorite.findMany({
      where: { userId: user.id },
      select: { projectId: true },
    })
    return reply.send(favorites.map((f: { projectId: string }) => f.projectId))
  })
}

export default favoritesModule
