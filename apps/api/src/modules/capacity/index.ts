import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'
import type { TrafficProfile } from '@gridhive/shared'
import { CapacityEngine } from '../../lib/capacity/CapacityEngine.js'

const engine = new CapacityEngine()

const capacityModule: FastifyPluginAsync = async (fastify) => {
  // GET /capacity/traffic-profiles — list all built-in profiles
  fastify.get('/traffic-profiles', async (_request, reply) => {
    const profiles = await fastify.prisma.trafficProfile.findMany({
      where: { isBuiltin: true },
      orderBy: { name: 'asc' },
    })
    return reply.send({ data: profiles })
  })

  // POST /capacity/calculate
  fastify.post('/calculate', async (request, reply) => {
    const body = z.object({
      topology: TopologySnapshotSchema,
      trafficProfiles: z.record(z.string(), z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().default(''),
        avgBandwidthMbps: z.number(),
        peakBandwidthMbps: z.number(),
        concurrencyFactor: z.number().default(0.7),
        trafficType: z.string(),
        burstDuration: z.string().default('continuous'),
      })).default({}),
    }).parse(request.body)

    const profileMap = new Map<string, TrafficProfile>(
      Object.entries(body.trafficProfiles).map(([k, v]) => [k, v as TrafficProfile])
    )

    // Also fetch built-in profiles from DB to supplement
    const builtins = await fastify.prisma.trafficProfile.findMany({ where: { isBuiltin: true } })
    for (const p of builtins) {
      if (!profileMap.has(p.id)) {
        profileMap.set(p.id, {
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          avgBandwidthMbps: p.avgBandwidthMbps,
          peakBandwidthMbps: p.peakBandwidthMbps,
          concurrencyFactor: p.concurrencyFactor,
          trafficType: p.trafficType as TrafficProfile['trafficType'],
          burstDuration: p.burstDuration as TrafficProfile['burstDuration'],
        })
      }
    }

    const result = engine.calculate(body.topology as import('@gridhive/shared').TopologySnapshot, profileMap)
    return reply.send({ data: result })
  })
}

export default capacityModule
