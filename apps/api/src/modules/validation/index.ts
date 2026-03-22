import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'
import { ValidationRunRequestSchema } from '@gridhive/shared'
import { ValidationEngine } from '../../lib/validation/ValidationEngine.js'

const validationModule: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    const body = ValidationRunRequestSchema.parse(request.body)
    const engine = new ValidationEngine()
    const results = engine.run(body.topology)

    return reply.send({ data: results })
  })
}

export default validationModule
