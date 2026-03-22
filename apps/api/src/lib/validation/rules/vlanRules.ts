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

export function runVlanRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes, edges } = topology

  // Collect all VLANs referenced
  const referencedVlans = new Set<number>()
  for (const node of nodes) {
    if (node.data.vlanId) referencedVlans.add(node.data.vlanId)
    if (node.data.vlanTrunkPorts) node.data.vlanTrunkPorts.forEach(v => referencedVlans.add(v))
  }
  for (const edge of edges) {
    if (edge.data.vlanTag) referencedVlans.add(edge.data.vlanTag)
    if (edge.data.trunkVlans) edge.data.trunkVlans.forEach(v => referencedVlans.add(v))
  }

  // VLAN_TRUNK_MISSING: two switches connected but no trunk configured
  const switchTypes = new Set(['switch-l2', 'switch-l3'])
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (sourceNode && targetNode &&
        switchTypes.has(sourceNode.type) && switchTypes.has(targetNode.type)) {
      // If both endpoints are on different VLANs and no trunk is configured
      const sourceVlans = sourceNode.data.vlanTrunkPorts || []
      const edgeTrunkVlans = edge.data.trunkVlans || []

      if (sourceVlans.length === 0 && edgeTrunkVlans.length === 0 && !edge.data.uplink) {
        // Check if either switch has multiple VLANs that need to pass between them
        const nodesOnSourceSwitch = nodes.filter(n => {
          const connectedEdges = edges.filter(e => e.source === sourceNode.id || e.target === sourceNode.id)
          return connectedEdges.some(e => (e.source === n.id || e.target === n.id) && n.id !== sourceNode.id)
        })
        // Only warn if both switches have devices with VLANs configured
        const switchesHaveVlans = nodes.some(n => n.data.vlanId && n.data.vlanId > 0)
        if (switchesHaveVlans) {
          results.push(makeResult(
            'warning',
            'VLAN_TRUNK_MISSING',
            'Missing Trunk Configuration',
            `Connection between switches ${sourceNode.data.hostname} and ${targetNode.data.hostname} has no trunk VLANs configured. VLANs will not pass between them.`,
            'Configure trunk VLANs on the inter-switch connection to allow VLAN traffic to traverse.',
            [sourceNode.id, targetNode.id],
            [edge.id],
          ))
        }
      }
    }
  }

  // GUEST_NOT_SEGMENTED: WAP marked guest with no isolated VLAN
  for (const node of nodes) {
    if (node.type === 'wireless-ap') {
      const hasGuestRole = node.data.role?.toLowerCase().includes('guest')
      if (hasGuestRole && !node.data.vlanId) {
        results.push(makeResult(
          'warning',
          'GUEST_NOT_SEGMENTED',
          'Guest WiFi Not Segmented',
          `Wireless AP ${node.data.hostname} is marked as guest but has no VLAN configured.`,
          'Assign a dedicated VLAN (e.g., VLAN 30) to the guest SSID to isolate guest traffic.',
          [node.id],
        ))
      }
    }
  }

  // CAMERA_NOT_ISOLATED: camera shares VLAN with workstations
  const cameraVlans = new Set<number>()
  const workstationVlans = new Set<number>()
  const cameraNodes: string[] = []
  const workstationNodes: string[] = []

  for (const node of nodes) {
    if (node.type === 'camera' && node.data.vlanId) {
      cameraVlans.add(node.data.vlanId)
      cameraNodes.push(node.id)
    }
    if (node.type === 'workstation' && node.data.vlanId) {
      workstationVlans.add(node.data.vlanId)
      workstationNodes.push(node.id)
    }
  }

  for (const vlan of cameraVlans) {
    if (workstationVlans.has(vlan)) {
      results.push(makeResult(
        'warning',
        'CAMERA_NOT_ISOLATED',
        'Camera Not Isolated from Workstations',
        `Cameras and workstations share VLAN ${vlan}. Cameras should be on a dedicated VLAN.`,
        'Move cameras to a dedicated VLAN (e.g., VLAN 40) isolated from workstations.',
        [...cameraNodes, ...workstationNodes],
      ))
    }
  }

  // INTERVLAN_MISSING: multiple VLANs exist but no L3 routing device
  const allVlans = new Set<number>()
  for (const node of nodes) {
    if (node.data.vlanId) allVlans.add(node.data.vlanId)
  }

  if (allVlans.size > 1) {
    const hasL3Device = nodes.some(n =>
      (n.type === 'switch-l3' && n.data.interVlanRouting) ||
      n.type === 'router' ||
      n.type === 'firewall'
    )

    if (!hasL3Device) {
      results.push(makeResult(
        'error',
        'INTERVLAN_MISSING',
        'No Inter-VLAN Routing Device',
        `Topology has ${allVlans.size} VLANs (${Array.from(allVlans).join(', ')}) but no L3 switch with inter-VLAN routing or router.`,
        'Add a Layer 3 switch with inter-VLAN routing enabled, or a router, to route traffic between VLANs.',
        nodes.filter(n => n.data.vlanId).map(n => n.id),
      ))
    }
  }

  return results
}
