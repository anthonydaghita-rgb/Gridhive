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

export function runRoutingRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes, edges } = topology

  const internetNode = nodes.find(n => n.type === 'internet')
  const firewallNodes = nodes.filter(n => n.type === 'firewall' || n.type === 'firewall-edge')
  const routerNodes = nodes.filter(n => n.type === 'router')

  // NO_WAN_GATEWAY: internet node present but no firewall/router between it and LAN
  if (internetNode) {
    const hasWanGateway = firewallNodes.length > 0 || routerNodes.length > 0
    if (!hasWanGateway) {
      results.push(makeResult(
        'error',
        'NO_WAN_GATEWAY',
        'No WAN Gateway',
        'Internet node is present but no firewall or router exists to serve as WAN gateway.',
        'Add a firewall or router to sit between the internet and your LAN.',
        [internetNode.id],
      ))
    }
  }

  // MISSING_DEFAULT_GW: end devices without a gateway configured
  const endDeviceTypes = new Set(['workstation', 'server', 'printer', 'voip-phone', 'nas', 'camera'])
  for (const node of nodes) {
    if (endDeviceTypes.has(node.type) && node.data.ipAddress && !node.data.defaultGateway) {
      results.push(makeResult(
        'warning',
        'MISSING_DEFAULT_GW',
        'Missing Default Gateway',
        `Device ${node.data.hostname} has an IP address but no default gateway configured. It cannot reach other subnets.`,
        'Configure a default gateway IP on this device.',
        [node.id],
      ))
    }
  }

  // INTERNET_PATH_INVALID: internet node exists but no valid connected path
  if (internetNode) {
    const internetConnections = edges.filter(e =>
      e.source === internetNode.id || e.target === internetNode.id
    )
    if (internetConnections.length === 0) {
      results.push(makeResult(
        'error',
        'INTERNET_PATH_INVALID',
        'Internet Node Disconnected',
        'The internet node has no connections. It must be connected to a firewall or router.',
        'Connect the internet node to a firewall or edge router via a WAN link.',
        [internetNode.id],
      ))
    }
  }

  // ORPHANED_SUBNET: a subnet exists but no routing device reaches it
  const subnets = new Map<string, string[]>()
  for (const node of nodes) {
    if (node.data.subnet) {
      if (!subnets.has(node.data.subnet)) subnets.set(node.data.subnet, [])
      subnets.get(node.data.subnet)!.push(node.id)
    }
  }

  if (subnets.size > 1) {
    const routingDevices = nodes.filter(n =>
      n.type === 'router' ||
      n.type === 'firewall' ||
      n.type === 'firewall-edge' ||
      (n.type === 'switch-l3' && n.data.interVlanRouting)
    )

    for (const [subnet, nodeIds] of subnets.entries()) {
      const subnetHasRouter = routingDevices.some(rd => {
        // Check if routing device is connected to any device in this subnet
        return edges.some(e => {
          const isConnectedToRouter = e.source === rd.id || e.target === rd.id
          const otherNodeId = e.source === rd.id ? e.target : e.source
          return isConnectedToRouter && nodeIds.includes(otherNodeId)
        })
      })

      if (!subnetHasRouter && routingDevices.length > 0) {
        results.push(makeResult(
          'warning',
          'ORPHANED_SUBNET',
          'Orphaned Subnet',
          `Subnet ${subnet} has no routing device directly connected. Traffic cannot be routed in or out.`,
          'Connect a router, firewall, or L3 switch with inter-VLAN routing to this subnet.',
          nodeIds,
        ))
      }
    }
  }

  return results
}
