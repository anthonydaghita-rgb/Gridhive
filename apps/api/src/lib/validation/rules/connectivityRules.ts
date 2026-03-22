import { randomUUID } from 'crypto'
import type { TopologySnapshot, ValidationResult } from '@gridhive/shared'

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

export function runConnectivityRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes, edges } = topology

  // Build adjacency
  const connectionCount = new Map<string, number>()
  for (const node of nodes) connectionCount.set(node.id, 0)
  for (const edge of edges) {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1)
    connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1)
  }

  // ORPHANED_DEVICE: device with zero connections
  for (const node of nodes) {
    if (node.type === 'internet') continue // internet nodes can be "unconnected" while building
    const count = connectionCount.get(node.id) || 0
    if (count === 0) {
      results.push(makeResult(
        'warning',
        'ORPHANED_DEVICE',
        'Orphaned Device',
        `Device ${node.data.hostname} has no connections. It is isolated from the network.`,
        'Connect this device to a switch, router, or other network device.',
        [node.id],
      ))
    }
  }

  // MISSING_UPLINK: switches and routers with no upstream connection
  const switchTypes = new Set(['switch-l2', 'switch-l3'])
  for (const node of nodes) {
    if (switchTypes.has(node.type)) {
      // A switch should connect to a router/firewall/other-switch upstream
      const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id)
      const upstreamNodes = connectedEdges.map(e => {
        const otherId = e.source === node.id ? e.target : e.source
        return nodes.find(n => n.id === otherId)
      }).filter(Boolean)

      const hasUpstream = upstreamNodes.some(n =>
        n!.type === 'router' || n!.type === 'firewall' || n!.type === 'firewall-edge' ||
        n!.type === 'switch-l2' || n!.type === 'switch-l3'
      )

      const hasDownstream = upstreamNodes.some(n =>
        n!.type === 'workstation' || n!.type === 'server' || n!.type === 'printer' ||
        n!.type === 'voip-phone' || n!.type === 'camera' || n!.type === 'nas' ||
        n!.type === 'wireless-ap' || n!.type === 'plc' || n!.type === 'sensor' || n!.type === 'hmi'
      )

      if (hasDownstream && !hasUpstream && upstreamNodes.length > 0) {
        results.push(makeResult(
          'warning',
          'MISSING_UPLINK',
          'Switch Missing Uplink',
          `Switch ${node.data.hostname} has end devices connected but no upstream connection to a router, firewall, or distribution switch.`,
          'Connect this switch to a router, firewall, or distribution/core switch.',
          [node.id],
        ))
      }
    }
  }

  // DEAD_END_DEVICE: device connects to only one other node (informational)
  const infrastructureTypes = new Set(['switch-l2', 'switch-l3', 'router', 'firewall', 'firewall-edge', 'wireless-ap', 'patch-panel'])
  for (const node of nodes) {
    if (!infrastructureTypes.has(node.type) || node.type === 'internet') continue
    const count = connectionCount.get(node.id) || 0
    if (count === 1 && infrastructureTypes.has(node.type)) {
      results.push(makeResult(
        'info',
        'DEAD_END_DEVICE',
        'Single-Connection Infrastructure Device',
        `${node.data.hostname} (${node.type}) has only one connection, making it a single point of failure.`,
        'Consider adding redundant connections for critical infrastructure devices.',
        [node.id],
      ))
    }
  }

  return results
}
