import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { TopologySnapshotSchema } from '@gridhive/shared'
import { HIPAAFramework } from '../../lib/compliance/frameworks/HIPAAFramework.js'
import { NISTCSFFramework } from '../../lib/compliance/frameworks/NISTCSFFramework.js'
import { CMMCFramework } from '../../lib/compliance/frameworks/CMMCFramework.js'
import { PCIDSSFramework } from '../../lib/compliance/frameworks/PCIDSSFramework.js'
import { SOC2Framework } from '../../lib/compliance/frameworks/SOC2Framework.js'

const frameworks = {
  hipaa: new HIPAAFramework(),
  'nist-csf': new NISTCSFFramework(),
  'cmmc-l2': new CMMCFramework(),
  'pci-dss': new PCIDSSFramework(),
  soc2: new SOC2Framework(),
} as const

type SupportedFrameworkId = keyof typeof frameworks

const FRAMEWORK_META: Record<SupportedFrameworkId, { name: string; description: string }> = {
  hipaa: {
    name: 'HIPAA Security Rule',
    description: 'Health Insurance Portability and Accountability Act — network security requirements for healthcare organizations handling PHI.',
  },
  'nist-csf': {
    name: 'NIST Cybersecurity Framework',
    description: 'NIST CSF 2.0 — identify, protect, detect, respond, and recover functions for critical infrastructure.',
  },
  'cmmc-l2': {
    name: 'CMMC Level 2',
    description: 'Cybersecurity Maturity Model Certification — required for DoD contractors handling CUI.',
  },
  'pci-dss': {
    name: 'PCI DSS v4.0',
    description: 'Payment Card Industry Data Security Standard — network requirements for organizations handling cardholder data.',
  },
  soc2: {
    name: 'SOC 2 Type II',
    description: 'AICPA Trust Services Criteria — security, availability, and confidentiality for SaaS and cloud providers.',
  },
}

const RunRequestSchema = z.object({
  topology: TopologySnapshotSchema,
  frameworkId: z.enum(['hipaa', 'nist-csf', 'cmmc-l2', 'pci-dss', 'soc2']),
})

const complianceModule: FastifyPluginAsync = async (fastify) => {
  // GET /compliance/frameworks — list available frameworks
  fastify.get('/frameworks', async (_request, reply) => {
    const list = (Object.keys(FRAMEWORK_META) as SupportedFrameworkId[]).map((id) => ({
      id,
      ...FRAMEWORK_META[id],
    }))
    return reply.send({ data: list })
  })

  // POST /compliance/run — run a compliance check
  fastify.post('/run', async (request, reply) => {
    const parsed = RunRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request', details: parsed.error.flatten() })
    }

    const { topology, frameworkId } = parsed.data
    const framework = frameworks[frameworkId]
    if (!framework) {
      return reply.status(400).send({ error: `Unknown framework: ${frameworkId}` })
    }

    try {
      const report = framework.check(topology)
      return reply.send({ data: report })
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ error: 'Compliance check failed' })
    }
  })
}

export default complianceModule
