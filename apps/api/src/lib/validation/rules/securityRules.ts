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

export function runSecurityRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes, edges } = topology

  const firewallNodes = nodes.filter(n => n.type === 'firewall' || n.type === 'firewall-edge')
  const internetNode = nodes.find(n => n.type === 'internet')

  // NO_FIREWALL: no firewall device exists
  if (nodes.length > 2 && firewallNodes.length === 0) {
    results.push(makeResult(
      'error',
      'NO_FIREWALL',
      'No Firewall in Topology',
      'The topology has no firewall device. All traffic is unrestricted.',
      'Add a firewall between the internet and your internal network.',
      nodes.map(n => n.id),
    ))
  }

  // FIREWALL_BYPASSED: path from internet to LAN without firewall
  if (internetNode && firewallNodes.length > 0) {
    // Check if internet is directly connected to non-firewall devices
    const internetEdges = edges.filter(e => e.source === internetNode.id || e.target === internetNode.id)
    for (const edge of internetEdges) {
      const connectedNodeId = edge.source === internetNode.id ? edge.target : edge.source
      const connectedNode = nodes.find(n => n.id === connectedNodeId)
      if (connectedNode && connectedNode.type !== 'firewall' && connectedNode.type !== 'firewall-edge' && connectedNode.type !== 'router') {
        results.push(makeResult(
          'error',
          'FIREWALL_BYPASSED',
          'Firewall Bypassed',
          `Internet node is directly connected to ${connectedNode.data.hostname} (${connectedNode.type}) without a firewall in between.`,
          'Ensure all internet traffic passes through the firewall before reaching internal devices.',
          [internetNode.id, connectedNodeId],
          [edge.id],
        ))
      }
    }
  }

  // DMZ_NOT_ISOLATED: DMZ segment reachable from internal LAN directly
  const dmzNodes = nodes.filter(n => {
    const role = n.data.role?.toLowerCase() || ''
    const vlan = n.data.vlanId
    return role.includes('dmz') || vlan === 50
  })

  const lanNodes = nodes.filter(n => {
    const role = n.data.role?.toLowerCase() || ''
    return !role.includes('dmz') && n.type !== 'internet' && n.type !== 'firewall' && n.type !== 'firewall-edge'
  })

  for (const dmzNode of dmzNodes) {
    for (const lanNode of lanNodes) {
      const directConnection = edges.find(e =>
        (e.source === dmzNode.id && e.target === lanNode.id) ||
        (e.source === lanNode.id && e.target === dmzNode.id)
      )
      if (directConnection) {
        results.push(makeResult(
          'error',
          'DMZ_NOT_ISOLATED',
          'DMZ Not Isolated from LAN',
          `DMZ device ${dmzNode.data.hostname} is directly connected to LAN device ${lanNode.data.hostname} without a firewall.`,
          'Route DMZ-to-LAN traffic through a firewall to enforce access control.',
          [dmzNode.id, lanNode.id],
          [directConnection.id],
        ))
      }
    }
  }

  // POE_INVALID: PoE assumed on connection to non-PoE switch
  for (const edge of edges) {
    if (edge.data.poe) {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)

      // Check if connected to a switch (switches typically provide PoE)
      const hasSwitch = (sourceNode && (sourceNode.type === 'switch-l2' || sourceNode.type === 'switch-l3')) ||
                        (targetNode && (targetNode.type === 'switch-l2' || targetNode.type === 'switch-l3'))

      if (!hasSwitch) {
        results.push(makeResult(
          'warning',
          'POE_INVALID',
          'PoE on Non-Switch Connection',
          'PoE is configured on a connection that does not involve a PoE-capable switch.',
          'Verify PoE is supported on the connected switch port.',
          [edge.source, edge.target],
          [edge.id],
        ))
      }
    }
  }

  return results
}
