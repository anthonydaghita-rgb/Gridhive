import type { TopologySnapshot, ConnectionType, DeviceType, LateralMovementResult, LateralMovementHop, BlastRadiusTier, LMRemediation, WorstCaseResult, WorstCaseEntry } from '@gridhive/shared'

// Pivot potential by connection type (probability of successful lateral movement per hop)
const PIVOT_WEIGHTS: Partial<Record<ConnectionType, number>> = {
  'rdp': 0.9, 'ssh': 0.9,
  'ethernet-copper': 0.8, 'ethernet-fiber': 0.8, 'ethernet-sfp': 0.75, 'ethernet-dac': 0.75,
  'trunk-8021q': 0.7, 'access-port': 0.75,
  'vlan-routing': 0.55, 'routed-static': 0.5,
  'site-to-site-ipsec': 0.5, 'site-to-site-ssl': 0.5, 'ssl-vpn-client': 0.45,
  'wireguard': 0.4, 'gre-tunnel': 0.4, 'cloud-vpn': 0.35,
  'wifi': 0.65, 'wifi-backhaul': 0.6,
  'ospf': 0.45, 'bgp': 0.4, 'eigrp': 0.45, 'mpls': 0.5, 'sd-wan': 0.45,
  'snmp': 0.1, 'netflow': 0.05, 'syslog': 0.05, 'restful-api': 0.2,
  'modbus-tcp': 0.15, 'profinet': 0.15, 'bacnet': 0.1, 'dnp3': 0.1, 'opc-ua': 0.2,
  'iscsi': 0.3, 'fibre-channel': 0.25, 'nfs': 0.35, 'smb': 0.8,
  'poe': 0.05, 'poe-plus': 0.05, 'poe-bt': 0.05,
  'osdp': 0.05, 'wiegand': 0.05,
  'fortilink': 0.3, 'unifi-adopt': 0.3,
  'internet-access': 0.2, 'direct-connect': 0.3, 'peering': 0.25,
}

const DEFAULT_PIVOT_WEIGHT = 0.35

// Device criticality scores (1-10)
const DEVICE_CRITICALITY: Partial<Record<DeviceType, number>> = {
  'server': 6, 'nas': 5, 'workstation': 3, 'printer': 2,
  'wireless-ap': 3, 'camera': 2, 'voip-phone': 2,
  'firewall': 7, 'firewall-edge': 7, 'router': 6, 'switch-l3': 5, 'switch-l2': 4,
  'plc': 8, 'scada-server': 10, 'historian-server': 8, 'hmi': 7, 'rtu': 7,
  'dcs': 9, 'sis-controller': 10, 'ied': 7,
  'emr-server': 10, 'pacs-server': 9, 'patient-monitor': 6, 'medical-device': 7,
  'hypervisor': 8, 'blade-server': 7, 'gpu-server': 7, 'container-host': 7,
  'backup-appliance': 8, 'san-switch': 7, 'tape-library': 7,
  'siem-server': 8, 'radius-server': 7, 'dns-server': 7,
  'load-balancer': 6, 'internet': 1,
}

const DEFAULT_CRITICALITY = 3

interface GraphEdge {
  nodeId: string
  pivotWeight: number
  edgeId: string
  hasFirewall: boolean
}

type Graph = Map<string, GraphEdge[]>

export class LateralMovementEngine {
  private buildGraph(topology: TopologySnapshot): Graph {
    const graph: Graph = new Map()

    // Initialize all nodes
    for (const node of topology.nodes) {
      graph.set(node.id, [])
    }

    // Build adjacency: for each edge, both directions are possible
    for (const edge of topology.edges) {
      const data = edge.data ?? {}
      const connType = (data.connectionType ?? data.mediaType) as ConnectionType | undefined
      let weight = connType ? (PIVOT_WEIGHTS[connType] ?? DEFAULT_PIVOT_WEIGHT) : DEFAULT_PIVOT_WEIGHT

      // Check if a firewall is the source or target — reduce weight
      const sourceNode = topology.nodes.find(n => n.id === edge.source)
      const targetNode = topology.nodes.find(n => n.id === edge.target)
      const hasFirewall =
        sourceNode?.type === 'firewall' || sourceNode?.type === 'firewall-edge' ||
        targetNode?.type === 'firewall' || targetNode?.type === 'firewall-edge'
      if (hasFirewall) weight *= 0.5

      // simulated-down edges are not pivot-able
      if ((data.status as string) === 'simulated-down') weight = 0

      if (weight > 0) {
        graph.get(edge.source)?.push({ nodeId: edge.target, pivotWeight: weight, edgeId: edge.id, hasFirewall })
        graph.get(edge.target)?.push({ nodeId: edge.source, pivotWeight: weight, edgeId: edge.id, hasFirewall })
      }
    }

    return graph
  }

  private getCriticality(nodeId: string, topology: TopologySnapshot): number {
    const node = topology.nodes.find(n => n.id === nodeId)
    if (!node) return 0
    const data = node.data as Record<string, unknown>
    if (typeof data.assetCriticality === 'number') return data.assetCriticality
    return (DEVICE_CRITICALITY[node.type as DeviceType] ?? DEFAULT_CRITICALITY)
  }

  runBlastRadius(topology: TopologySnapshot, sourceNodeId: string, maxHops = 6): LateralMovementResult {
    const graph = this.buildGraph(topology)
    const reachability: LateralMovementHop[] = []

    // BFS with probability tracking (noisy-OR for parallel paths)
    const prob = new Map<string, number>()
    const hopsCount = new Map<string, number>()
    const paths = new Map<string, string[]>()
    prob.set(sourceNodeId, 1.0)
    hopsCount.set(sourceNodeId, 0)
    paths.set(sourceNodeId, [sourceNodeId])

    const queue: string[] = [sourceNodeId]
    const visited = new Set<string>([sourceNodeId])

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentHops = hopsCount.get(current) ?? 0
      if (currentHops >= maxHops) continue

      const currentProb = prob.get(current) ?? 0
      const neighbors = graph.get(current) ?? []

      for (const neighbor of neighbors) {
        const newProb = currentProb * neighbor.pivotWeight
        const existing = prob.get(neighbor.nodeId) ?? 0

        // Noisy-OR: combine parallel paths
        const combined = 1 - (1 - existing) * (1 - newProb)

        if (combined > existing) {
          prob.set(neighbor.nodeId, combined)
          if (!visited.has(neighbor.nodeId)) {
            hopsCount.set(neighbor.nodeId, currentHops + 1)
            paths.set(neighbor.nodeId, [...(paths.get(current) ?? [current]), neighbor.nodeId])
            queue.push(neighbor.nodeId)
            visited.add(neighbor.nodeId)
          }
        }
      }
    }

    // Build results
    let blastScore = 0
    const criticalAtRisk: string[] = []
    let devicesReachable = 0

    for (const node of topology.nodes) {
      if (node.id === sourceNodeId) continue
      const p = prob.get(node.id) ?? 0
      const criticality = this.getCriticality(node.id, topology)

      let tier: BlastRadiusTier = 'unreachable'
      if (p >= 0.6) tier = 'primary'
      else if (p >= 0.3) tier = 'secondary'
      else if (p >= 0.1) tier = 'peripheral'

      if (tier !== 'unreachable') {
        devicesReachable++
        blastScore += Math.round(p * criticality * 10)
        if (criticality >= 8) criticalAtRisk.push(node.id)
      }

      reachability.push({
        nodeId: node.id,
        probability: Math.round(p * 1000) / 1000,
        hops: hopsCount.get(node.id) ?? 99,
        tier,
        attackPath: paths.get(node.id) ?? [],
        criticalityScore: criticality,
      })
    }

    const totalDevices = topology.nodes.length - 1
    const devicesProtected = totalDevices - devicesReachable
    const maxPossibleScore = topology.nodes
      .filter(n => n.id !== sourceNodeId)
      .reduce((sum, n) => sum + this.getCriticality(n.id, topology) * 10, 0)

    // Generate top remediations
    const remediations = this.generateRemediations(topology, reachability, blastScore)
    const lmsScore = this.calculateLmsScore(topology)

    return {
      sourceNodeId,
      blastRadiusScore: Math.min(blastScore, 1000),
      maxPossibleScore: Math.min(maxPossibleScore, 1000),
      criticalAssetsAtRisk: criticalAtRisk,
      devicesReachable,
      devicesProtected,
      totalDevices,
      reachability,
      remediations,
      lmsScore,
    }
  }

  private generateRemediations(
    topology: TopologySnapshot,
    reachability: LateralMovementHop[],
    currentScore: number
  ): LMRemediation[] {
    const rems: LMRemediation[] = []

    // Find workstation->server paths without a firewall between them
    const primaryReach = reachability.filter(r => r.tier === 'primary')
    const criticalReached = primaryReach.filter(r => r.criticalityScore >= 8)

    if (criticalReached.length > 0) {
      const reduction = Math.round(currentScore * 0.55)
      rems.push({
        rank: 1,
        description: `Add firewall or ACL rules between workstation VLANs and server VLANs to block lateral movement to ${criticalReached.length} critical asset(s)`,
        blastRadiusReduction: reduction,
        blastRadiusPctReduction: 55,
        affectedNodeIds: criticalReached.map(r => r.nodeId),
      })
    }

    if (primaryReach.length > 3) {
      const reduction = Math.round(currentScore * 0.25)
      rems.push({
        rank: rems.length + 1,
        description: 'Implement 802.1X network access control on workstation access ports to slow lateral spread and add authentication requirements per hop',
        blastRadiusReduction: reduction,
        blastRadiusPctReduction: 25,
        affectedNodeIds: primaryReach.map(r => r.nodeId),
      })
    }

    const backupNodes = topology.nodes.filter(n =>
      (n.type as string).includes('backup') || (n.data as Record<string, unknown>).role === 'backup-server'
    )
    const reachableBackups = backupNodes.filter(n => {
      const r = reachability.find(r => r.nodeId === n.id)
      return r && r.tier !== 'unreachable'
    })
    if (reachableBackups.length > 0) {
      const reduction = Math.round(currentScore * 0.15)
      rems.push({
        rank: rems.length + 1,
        description: 'Isolate backup systems on a dedicated VLAN with no direct workstation routing — attackers who can reach backups can destroy recovery capability',
        blastRadiusReduction: reduction,
        blastRadiusPctReduction: 15,
        affectedNodeIds: reachableBackups.map(n => n.id),
      })
    }

    return rems.slice(0, 4)
  }

  runWorstCase(topology: TopologySnapshot): WorstCaseResult {
    const entries: WorstCaseEntry[] = []

    for (const node of topology.nodes) {
      const result = this.runBlastRadius(topology, node.id, 6)
      entries.push({
        rank: 0,
        nodeId: node.id,
        blastRadiusScore: result.blastRadiusScore,
        criticalAssetsAtRisk: result.criticalAssetsAtRisk,
        devicesReachable: result.devicesReachable,
      })
    }

    entries.sort((a, b) => b.blastRadiusScore - a.blastRadiusScore)
    entries.forEach((e, i) => { e.rank = i + 1 })

    return {
      entries,
      networkLmsScore: this.calculateLmsScore(topology),
    }
  }

  calculateLmsScore(topology: TopologySnapshot): number {
    const n = topology.nodes.length
    if (n < 2) return 0

    // Estimate how connected the network is (more connections + fewer firewalls = higher LMS)
    const firewallCount = topology.nodes.filter(
      node => node.type === 'firewall' || node.type === 'firewall-edge'
    ).length
    const vlanCount = new Set(
      topology.nodes
        .map(n => (n.data as Record<string, unknown>).vlanId as number | undefined)
        .filter(Boolean)
    ).size
    const edgeCount = topology.edges.length

    // Base score: edge density
    const maxEdges = (n * (n - 1)) / 2
    const density = Math.min(edgeCount / Math.max(maxEdges, 1), 1)

    // Penalty: no firewalls, no VLANs
    const firewallFactor = firewallCount === 0 ? 1.0 : Math.max(0.3, 1 - firewallCount * 0.15)
    const vlanFactor = vlanCount <= 1 ? 1.0 : Math.max(0.3, 1 - (vlanCount - 1) * 0.08)

    const raw = density * firewallFactor * vlanFactor * 100
    return Math.round(Math.min(Math.max(raw, 5), 95))
  }
}
