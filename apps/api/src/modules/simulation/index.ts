import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'
import { SimulationRunRequestSchema } from '@gridhive/shared'
import { SimulationEngine } from '../../lib/simulation/SimulationEngine.js'

const simulationModule: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', { preHandler: requireAuth }, async (request, reply) => {
    const body = SimulationRunRequestSchema.parse(request.body)
    const engine = new SimulationEngine()
    const results = engine.run(body.topology, body.tests)

    return reply.send({ data: results })
  })
}

export default simulationModule
