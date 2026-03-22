// apps/api/src/lib/simulation/ReachabilityChecker.ts
import type { TopologySnapshot, SimulationHop, DeviceNode } from '@gridhive/shared'
import type { AdjacencyGraph, Neighbor } from './GraphBuilder.js'
import { SubnetCalculator } from './SubnetCalculator.js'

const calc = new SubnetCalculator()

export interface ReachabilityResult {
  reachable: boolean
  path: SimulationHop[]
  blockedAt?: string
  blockReason?: string
  warnings: string[]
}

export class ReachabilityChecker {
  check(
    topology: TopologySnapshot,
    graph: AdjacencyGraph,
    sourceId: string,
    targetId: string,
  ): ReachabilityResult {
    const sourceNode = topology.nodes.find(n => n.id === sourceId)
    const targetNode = topology.nodes.find(n => n.id === targetId)

    if (!sourceNode) {
      return { reachable: false, path: [], blockReason: `Source device ${sourceId} not found.`, warnings: [] }
    }
    if (!targetNode) {
      return { reachable: false, path: [], blockReason: `Target device ${targetId} not found.`, warnings: [] }
    }

    // BFS with path tracking
    const visited = new Set<string>()
    const queue: { nodeId: string; path: SimulationHop[]; warnings: string[] }[] = [
      {
        nodeId: sourceId,
        path: [this.makeHop(sourceNode, undefined, undefined, 'Source device')],
        warnings: [],
      },
    ]

    while (queue.length > 0) {
      const current = queue.shift()!

      if (visited.has(current.nodeId)) continue
      visited.add(current.nodeId)

      if (current.nodeId === targetId) {
        return {
          reachable: true,
          path: current.path,
          warnings: current.warnings,
        }
      }

      const neighbors = graph.get(current.nodeId) || []
      const currentNode = topology.nodes.find(n => n.id === current.nodeId)!

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.nodeId)) continue

        const neighborNode = topology.nodes.find(n => n.id === neighbor.nodeId)
        if (!neighborNode) continue

        // Apply real-world gate checks at this hop
        const gateCheck = this.checkGate(currentNode, neighborNode, neighbor, topology, current.path)

        if (gateCheck.blocked) {
          // If this is the target and it's blocked, record the block
          if (neighbor.nodeId === targetId) {
            return {
              reachable: false,
              path: [...current.path],
              blockedAt: neighbor.nodeId,
              blockReason: gateCheck.reason,
              warnings: current.warnings,
            }
          }
          continue
        }

        const nextHop = this.makeHop(
          neighborNode,
          neighbor.edge.data.sourcePort,
          neighborNode.data.vlanId,
          gateCheck.note,
        )

        queue.push({
          nodeId: neighbor.nodeId,
          path: [...current.path, nextHop],
          warnings: [...current.warnings, ...gateCheck.warnings],
        })
      }
    }

    return {
      reachable: false,
      path: [],
      blockedAt: sourceId,
      blockReason: `No path found from ${sourceNode.data.hostname} to ${targetNode.data.hostname}. Check physical connections.`,
      warnings: [],
    }
  }

  private checkGate(
    fromNode: DeviceNode,
    toNode: DeviceNode,
    neighbor: Neighbor,
    topology: TopologySnapshot,
    currentPath: SimulationHop[],
  ): { blocked: boolean; reason?: string; note?: string; warnings: string[] } {
    const edge = neighbor.edge
    const warnings: string[] = []

    // 1. Edge active check (handled by GraphBuilder filtering simulated-down edges)

    // 2. VLAN check: if both devices have VLANs configured, they must match OR there's a trunk
    const fromVlan = fromNode.data.vlanId
    const toVlan = toNode.data.vlanId

    if (fromVlan && toVlan && fromVlan !== toVlan) {
      // VLANs differ - need inter-VLAN routing
      const edgeHasTrunk = edge.data.trunkVlans &&
        edge.data.trunkVlans.includes(fromVlan) &&
        edge.data.trunkVlans.includes(toVlan)

      const toNodeIsRouter = toNode.type === 'router' || toNode.type === 'firewall' || toNode.type === 'firewall-edge'
      const toNodeIsL3Switch = toNode.type === 'switch-l3' && toNode.data.interVlanRouting

      if (!edgeHasTrunk && !toNodeIsRouter && !toNodeIsL3Switch) {
        return {
          blocked: true,
          reason: `BLOCKED -- inter-VLAN routing required. VLAN ${fromVlan} (${fromNode.data.hostname}) cannot reach VLAN ${toVlan} (${toNode.data.hostname}) without a Layer 3 routing device. No router or L3 switch with inter-VLAN routing found in path.`,
          warnings,
        }
      }
    }

    // 3. Subnet check: if crossing subnets, device must have a default gateway
    const fromIp = fromNode.data.ipAddress
    const toIp = toNode.data.ipAddress
    const fromSubnet = fromNode.data.subnet || (fromIp ? this.getSubnetFromIp(fromIp) : undefined)
    const toSubnet = toNode.data.subnet || (toIp ? this.getSubnetFromIp(toIp) : undefined)

    if (fromIp && toIp && fromSubnet && toSubnet) {
      const fromIpClean = fromIp.split('/')[0]
      const toIpClean = toIp.split('/')[0]

      const sameSubnet = calc.sameSubnet(fromIpClean, toIpClean, fromSubnet)

      if (!sameSubnet) {
        // Crossing subnets
        const fromIsEndDevice = ['workstation', 'server', 'printer', 'voip-phone', 'nas', 'camera', 'plc', 'sensor', 'hmi'].includes(fromNode.type)

        if (fromIsEndDevice && !fromNode.data.defaultGateway) {
          return {
            blocked: true,
            reason: `BLOCKED -- no default gateway configured. ${fromNode.data.hostname} cannot reach ${toNode.data.hostname} on subnet ${toSubnet} because no default gateway is set. Configure a default gateway on ${fromNode.data.hostname}.`,
            warnings,
          }
        }

        // If this hop is to a router/firewall/L3-switch, that's fine - it's the gateway
        const toNodeIsRoutingDevice = toNode.type === 'router' || toNode.type === 'firewall' ||
          toNode.type === 'firewall-edge' || (toNode.type === 'switch-l3' && toNode.data.interVlanRouting)

        if (!toNodeIsRoutingDevice && fromIsEndDevice) {
          return {
            blocked: true,
            reason: `BLOCKED -- routing required. ${fromNode.data.hostname} (${fromSubnet}) cannot directly reach ${toNode.data.hostname} (${toSubnet}). A router or L3 device must be in the path.`,
            warnings,
          }
        }
      }
    }

    // 4. Firewall check: if toNode is a firewall, note the traversal
    if (toNode.type === 'firewall' || toNode.type === 'firewall-edge') {
      return {
        blocked: false,
        note: `Traversing firewall ${toNode.data.hostname}`,
        warnings,
      }
    }

    // 5. L3 switch inter-VLAN routing note
    if (toNode.type === 'switch-l3' && toNode.data.interVlanRouting && fromVlan && toVlan && fromVlan !== toVlan) {
      return {
        blocked: false,
        note: `Inter-VLAN routing via L3 switch SVI (VLAN ${fromVlan} -> VLAN ${toVlan})`,
        warnings,
      }
    }

    return { blocked: false, warnings }
  }

  private getSubnetFromIp(ipWithPrefix: string): string | undefined {
    if (!ipWithPrefix.includes('/')) return undefined
    try {
      return calc.getNetworkCidr(ipWithPrefix)
    } catch {
      return undefined
    }
  }

  private makeHop(
    node: DeviceNode,
    iface?: string,
    vlan?: number,
    note?: string,
  ): SimulationHop {
    return {
      nodeId: node.id,
      nodeLabel: node.data.label || node.data.hostname,
      deviceType: node.type,
      interface: iface,
      vlan: vlan || node.data.vlanId,
      note,
    }
  }
}
