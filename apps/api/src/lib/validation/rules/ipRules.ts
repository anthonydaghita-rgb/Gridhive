import { randomUUID } from 'crypto'
import type { TopologySnapshot, ValidationResult, DeviceNode } from '@gridhive/shared'
import { SubnetCalculator } from '../../simulation/SubnetCalculator.js'

const calc = new SubnetCalculator()

function makeResult(
  severity: ValidationResult['severity'],
  code: string,
  title: string,
  description: string,
  recommendation: string,
  affectedNodeIds: string[],
  affectedEdgeIds: string[] = [],
): ValidationResult {
  return { id: randomUUID(), severity, code, title, description, recommendation, affectedNodeIds, affectedEdgeIds }
}

export function runIpRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const nodes = topology.nodes

  // IP_CONFLICT: two devices share the same IP
  const ipMap = new Map<string, string[]>()
  for (const node of nodes) {
    const ip = node.data.ipAddress
    if (ip) {
      const bare = ip.split('/')[0]
      if (!ipMap.has(bare)) ipMap.set(bare, [])
      ipMap.get(bare)!.push(node.id)
    }
  }
  for (const [ip, ids] of ipMap.entries()) {
    if (ids.length > 1) {
      results.push(makeResult(
        'error',
        'IP_CONFLICT',
        'IP Address Conflict',
        `Multiple devices share IP address ${ip}: ${ids.map(id => {
          const n = nodes.find(n => n.id === id)
          return n?.data.hostname || id
        }).join(', ')}`,
        'Assign unique IP addresses to each device.',
        ids,
      ))
    }
  }

  // SUBNET_MISMATCH: device IP not within its declared subnet
  for (const node of nodes) {
    const { ipAddress, subnet } = node.data
    if (ipAddress && subnet) {
      const ip = ipAddress.split('/')[0]
      try {
        if (!calc.isInSubnet(ip, subnet)) {
          results.push(makeResult(
            'error',
            'SUBNET_MISMATCH',
            'IP/Subnet Mismatch',
            `Device ${node.data.hostname} has IP ${ipAddress} which is not within subnet ${subnet}.`,
            'Ensure the device IP falls within the configured subnet range.',
            [node.id],
          ))
        }
      } catch {
        // invalid subnet notation, skip
      }
    }
  }

  // OVERLAPPING_SUBNET: two subnets share address space
  const subnets: { cidr: string; nodeId: string }[] = []
  for (const node of nodes) {
    if (node.data.subnet) {
      subnets.push({ cidr: node.data.subnet, nodeId: node.id })
    }
  }
  for (let i = 0; i < subnets.length; i++) {
    for (let j = i + 1; j < subnets.length; j++) {
      const a = subnets[i]
      const b = subnets[j]
      if (a.cidr === b.cidr) continue // same subnet is fine
      try {
        if (calc.overlaps(a.cidr, b.cidr)) {
          results.push(makeResult(
            'warning',
            'OVERLAPPING_SUBNET',
            'Overlapping Subnets',
            `Subnets ${a.cidr} and ${b.cidr} overlap.`,
            'Use non-overlapping subnet ranges to avoid routing ambiguity.',
            [a.nodeId, b.nodeId],
          ))
        }
      } catch {
        // skip invalid
      }
    }
  }

  // INVALID_GATEWAY: device gateway not within its subnet
  for (const node of nodes) {
    const { defaultGateway, subnet } = node.data
    if (defaultGateway && subnet) {
      try {
        if (!calc.isInSubnet(defaultGateway, subnet)) {
          results.push(makeResult(
            'error',
            'INVALID_GATEWAY',
            'Invalid Default Gateway',
            `Device ${node.data.hostname} has gateway ${defaultGateway} which is not within subnet ${subnet}.`,
            'Set the default gateway to an IP within the device subnet.',
            [node.id],
          ))
        }
      } catch {
        // skip
      }
    }
  }

  // DUPLICATE_HOSTNAME
  const hostnameMap = new Map<string, string[]>()
  for (const node of nodes) {
    const hn = node.data.hostname.toLowerCase()
    if (!hostnameMap.has(hn)) hostnameMap.set(hn, [])
    hostnameMap.get(hn)!.push(node.id)
  }
  for (const [hn, ids] of hostnameMap.entries()) {
    if (ids.length > 1) {
      results.push(makeResult(
        'warning',
        'DUPLICATE_HOSTNAME',
        'Duplicate Hostname',
        `Hostname "${hn}" is used by ${ids.length} devices.`,
        'Use unique hostnames for each device.',
        ids,
      ))
    }
  }

  return results
}
