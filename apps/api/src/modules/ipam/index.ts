import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../plugins/auth.js'
import { z } from 'zod'

// Helper: count IPs in CIDR
function cidrHostCount(cidr: string): number {
  const [, prefix] = cidr.split('/')
  const bits = parseInt(prefix)
  if (isNaN(bits) || bits > 32) return 0
  return Math.max(0, Math.pow(2, 32 - bits) - 2)
}

const ipamModule: FastifyPluginAsync = async (fastify) => {
  // ──────────────────────────────────────────────────────────────
  // NAMESPACES
  // ──────────────────────────────────────────────────────────────

  fastify.get('/namespaces', { preHandler: requireAuth }, async (request, reply) => {
    const namespaces = await fastify.prisma.ipamNamespace.findMany({
      where: { orgId: { in: await getMemberOrgIds(fastify, request.user!.id) } },
      include: {
        subnets: { select: { id: true, utilizationPct: true, status: true } },
      },
      orderBy: { name: 'asc' },
    })
    return reply.send({ data: namespaces })
  })

  fastify.post('/namespaces', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      orgId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
    }).parse(request.body)

    const ns = await fastify.prisma.ipamNamespace.create({
      data: { ...body, createdBy: request.user!.id },
    })
    return reply.status(201).send({ data: ns })
  })

  fastify.delete('/namespaces/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.ipamNamespace.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // ──────────────────────────────────────────────────────────────
  // SUPERNETS
  // ──────────────────────────────────────────────────────────────

  fastify.get('/namespaces/:nsId/supernets', { preHandler: requireAuth }, async (request, reply) => {
    const { nsId } = request.params as { nsId: string }
    const supernets = await fastify.prisma.ipamSupernet.findMany({
      where: { namespaceId: nsId },
      include: { subnets: { select: { id: true, cidr: true, name: true, status: true } } },
      orderBy: { cidr: 'asc' },
    })
    return reply.send({ data: supernets })
  })

  fastify.post('/namespaces/:nsId/supernets', { preHandler: requireAuth }, async (request, reply) => {
    const { nsId } = request.params as { nsId: string }
    const body = z.object({
      cidr: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      purpose: z.string().optional(),
    }).parse(request.body)

    const supernet = await fastify.prisma.ipamSupernet.create({
      data: { ...body, namespaceId: nsId },
    })
    return reply.status(201).send({ data: supernet })
  })

  // ──────────────────────────────────────────────────────────────
  // SUBNETS
  // ──────────────────────────────────────────────────────────────

  fastify.get('/namespaces/:nsId/subnets', { preHandler: requireAuth }, async (request, reply) => {
    const { nsId } = request.params as { nsId: string }
    const subnets = await fastify.prisma.ipamSubnet.findMany({
      where: { namespaceId: nsId },
      include: {
        _count: { select: { addresses: true } },
        addresses: { select: { status: true }, where: { status: { in: ['assigned', 'reserved'] } } },
      },
      orderBy: { cidr: 'asc' },
    })

    // Recalculate utilization on the fly
    const enriched = subnets.map(s => {
      const total = cidrHostCount(s.cidr)
      const used = s.addresses.length
      const utilizationPct = total > 0 ? Math.round((used / total) * 1000) / 10 : 0
      return { ...s, utilizationPct, totalHosts: total, usedHosts: used }
    })

    return reply.send({ data: enriched })
  })

  fastify.post('/namespaces/:nsId/subnets', { preHandler: requireAuth }, async (request, reply) => {
    const { nsId } = request.params as { nsId: string }
    const body = z.object({
      cidr: z.string(),
      name: z.string().min(1),
      supernetId: z.string().optional(),
      vlanId: z.number().optional(),
      vlanName: z.string().optional(),
      gatewayIp: z.string().optional(),
      dhcpServerIp: z.string().optional(),
      dnsServerIp: z.string().optional(),
      purpose: z.string().optional(),
      status: z.enum(['active', 'reserved', 'deprecated', 'planning']).default('active'),
      associatedProjectIds: z.array(z.string()).default([]),
    }).parse(request.body)

    const subnet = await fastify.prisma.ipamSubnet.create({
      data: { ...body, namespaceId: nsId, createdBy: request.user!.id },
    })
    return reply.status(201).send({ data: subnet })
  })

  fastify.delete('/subnets/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.ipamSubnet.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // ──────────────────────────────────────────────────────────────
  // ADDRESSES
  // ──────────────────────────────────────────────────────────────

  fastify.get('/subnets/:subnetId/addresses', { preHandler: requireAuth }, async (request, reply) => {
    const { subnetId } = request.params as { subnetId: string }
    const addresses = await fastify.prisma.ipamAddress.findMany({
      where: { subnetId },
      orderBy: { ipAddress: 'asc' },
    })
    return reply.send({ data: addresses })
  })

  fastify.post('/addresses', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      subnetId: z.string(),
      ipAddress: z.string(),
      hostname: z.string().optional(),
      macAddress: z.string().optional(),
      deviceType: z.string().optional(),
      status: z.enum(['assigned', 'reserved', 'available', 'conflict']).default('assigned'),
      associatedProjectId: z.string().optional(),
      associatedNodeId: z.string().optional(),
      leaseType: z.enum(['static', 'dhcp', 'reserved']).default('static'),
      notes: z.string().optional(),
    }).parse(request.body)

    const addr = await fastify.prisma.ipamAddress.create({ data: body })

    // Update subnet utilization
    await recalcSubnetUtilization(fastify, body.subnetId)

    return reply.status(201).send({ data: addr })
  })

  fastify.patch('/addresses/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      hostname: z.string().optional(),
      status: z.enum(['assigned', 'reserved', 'available', 'conflict', 'stale']).optional(),
      notes: z.string().optional(),
    }).parse(request.body)

    const addr = await fastify.prisma.ipamAddress.update({ where: { id }, data: body })
    return reply.send({ data: addr })
  })

  fastify.delete('/addresses/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const addr = await fastify.prisma.ipamAddress.findUnique({ where: { id } })
    if (!addr) return reply.status(404).send({ error: 'Not found' })
    await fastify.prisma.ipamAddress.delete({ where: { id } })
    await recalcSubnetUtilization(fastify, addr.subnetId)
    return reply.send({ success: true })
  })

  // ──────────────────────────────────────────────────────────────
  // SEARCH (global IP/hostname/MAC across all namespaces)
  // ──────────────────────────────────────────────────────────────

  fastify.get('/search', { preHandler: requireAuth }, async (request, reply) => {
    const { q } = request.query as { q?: string }
    if (!q || q.length < 2) return reply.send({ data: [] })

    const orgIds = await getMemberOrgIds(fastify, request.user!.id)
    const results = await fastify.prisma.ipamAddress.findMany({
      where: {
        OR: [
          { ipAddress: { contains: q } },
          { hostname: { contains: q, mode: 'insensitive' } },
          { macAddress: { contains: q, mode: 'insensitive' } },
        ],
        subnet: { namespace: { orgId: { in: orgIds } } },
      },
      include: {
        subnet: { include: { namespace: { select: { id: true, name: true } } } },
      },
      take: 25,
    })
    return reply.send({ data: results })
  })

  // ──────────────────────────────────────────────────────────────
  // UTILIZATION SUMMARY
  // ──────────────────────────────────────────────────────────────

  fastify.get('/utilization', { preHandler: requireAuth }, async (request, reply) => {
    const orgIds = await getMemberOrgIds(fastify, request.user!.id)
    const namespaces = await fastify.prisma.ipamNamespace.findMany({
      where: { orgId: { in: orgIds } },
      include: {
        subnets: {
          include: { _count: { select: { addresses: true } } },
        },
      },
    })

    const summary = namespaces.map(ns => {
      const totalIps = ns.subnets.reduce((s, sub) => s + cidrHostCount(sub.cidr), 0)
      const avgUtil = ns.subnets.length > 0
        ? ns.subnets.reduce((s, sub) => s + sub.utilizationPct, 0) / ns.subnets.length
        : 0
      return {
        namespaceId: ns.id,
        namespaceName: ns.name,
        subnetCount: ns.subnets.length,
        totalIps,
        avgUtilizationPct: Math.round(avgUtil * 10) / 10,
        highUtilSubnets: ns.subnets.filter(s => s.utilizationPct >= 80).length,
      }
    })

    return reply.send({ data: summary })
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getMemberOrgIds(fastify: import('fastify').FastifyInstance, userId: string): Promise<string[]> {
  const memberships = await fastify.prisma.orgMember.findMany({
    where: { userId },
    select: { orgId: true },
  })
  return memberships.map(m => m.orgId)
}

async function recalcSubnetUtilization(fastify: import('fastify').FastifyInstance, subnetId: string) {
  const subnet = await fastify.prisma.ipamSubnet.findUnique({ where: { id: subnetId } })
  if (!subnet) return
  const assigned = await fastify.prisma.ipamAddress.count({
    where: { subnetId, status: { in: ['assigned', 'reserved'] } },
  })
  const total = Math.max(cidrHostCount(subnet.cidr), 1)
  await fastify.prisma.ipamSubnet.update({
    where: { id: subnetId },
    data: { utilizationPct: Math.round((assigned / total) * 1000) / 10 },
  })
}

export default ipamModule
