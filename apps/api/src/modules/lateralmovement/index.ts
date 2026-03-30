import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'
import { LateralMovementEngine } from '../../lib/simulation/LateralMovementEngine.js'

const engine = new LateralMovementEngine()

const lmModule: FastifyPluginAsync = async (fastify) => {
  // POST /lm/blast-radius
  fastify.post('/blast-radius', async (request, reply) => {
    const body = z.object({
      topology: TopologySnapshotSchema,
      sourceNodeId: z.string(),
      maxHops: z.number().int().min(1).max(20).default(6),
    }).parse(request.body)

    const result = engine.runBlastRadius(body.topology as import('@gridhive/shared').TopologySnapshot, body.sourceNodeId, body.maxHops)
    return reply.send({ data: result })
  })

  // POST /lm/worst-case
  fastify.post('/worst-case', async (request, reply) => {
    const body = z.object({
      topology: TopologySnapshotSchema,
    }).parse(request.body)

    const result = engine.runWorstCase(body.topology as import('@gridhive/shared').TopologySnapshot)
    return reply.send({ data: result })
  })

  // POST /lm/network-score
  fastify.post('/network-score', async (request, reply) => {
    const body = z.object({
      topology: TopologySnapshotSchema,
    }).parse(request.body)

    const score = engine.calculateLmsScore(body.topology as import('@gridhive/shared').TopologySnapshot)
    return reply.send({ data: { lmsScore: score } })
  })
}

export default lmModule
