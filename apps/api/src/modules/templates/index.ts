import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'

const templatesModule: FastifyPluginAsync = async (fastify) => {
  // GET /templates
  fastify.get('/', async (request, reply) => {
    const templates = await fastify.prisma.template.findMany({
      where: { OR: [{ isSystem: true }, { orgId: null }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    })
    return reply.send({ data: templates })
  })

  // GET /templates/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const template = await fastify.prisma.template.findUnique({ where: { id } })
    if (!template) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ data: template })
  })

  // POST /templates (save user template)
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      category: z.string(),
      topology: TopologySnapshotSchema,
      orgId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).parse(request.body)

    const template = await fastify.prisma.template.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        category: body.category,
        topology: body.topology as object,
        orgId: body.orgId,
        tags: body.tags || [],
        difficulty: body.difficulty || 'beginner',
        createdBy: request.user!.id,
      },
    })

    return reply.status(201).send({ data: template })
  })

  // DELETE /templates/:id
  fastify.delete('/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const template = await fastify.prisma.template.findUnique({ where: { id } })
    if (!template) return reply.status(404).send({ error: 'Not Found' })
    if (template.isSystem) return reply.status(403).send({ error: 'Cannot delete system templates' })
    if (template.createdBy !== request.user!.id) return reply.status(403).send({ error: 'Forbidden' })

    await fastify.prisma.template.delete({ where: { id } })
    return reply.status(204).send()
  })

  // POST /templates/:id/duplicate
  fastify.post('/:id/duplicate', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const template = await fastify.prisma.template.findUnique({ where: { id } })
    if (!template) return reply.status(404).send({ error: 'Not Found' })

    const newSlug = `${template.slug}-copy-${Date.now()}`
    const copy = await fastify.prisma.template.create({
      data: {
        name: `${template.name} (Copy)`,
        slug: newSlug,
        description: template.description,
        category: template.category,
        topology: template.topology,
        tags: template.tags,
        difficulty: template.difficulty,
        simTestSuite: template.simTestSuite,
        createdBy: request.user!.id,
      },
    })

    return reply.status(201).send({ data: copy })
  })
}

export default templatesModule
