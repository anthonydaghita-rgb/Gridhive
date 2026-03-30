import type { TopologySnapshot, TrafficProfile, CapacityResult, LinkUtilization, CapacityBottleneck, QosRequirement } from '@gridhive/shared'

const SPEED_MBPS: Record<string, number> = {
  '10M': 10, '100M': 100, '1G': 1000, '10G': 10000,
  '25G': 25000, '40G': 40000, '100G': 100000, 'variable': 100,
}

function parseLinkSpeed(speed: string | undefined): number {
  if (!speed) return 1000
  return SPEED_MBPS[speed] ?? 1000
}

export class CapacityEngine {
  calculate(
    topology: TopologySnapshot,
    trafficProfiles: Map<string, TrafficProfile>
  ): CapacityResult {
    // Calculate per-device bandwidth demand
    const deviceAvg = new Map<string, number>()
    const devicePeak = new Map<string, number>()

    for (const node of topology.nodes) {
      const data = node.data as Record<string, unknown>
      const profileId = data.trafficProfileId as string | undefined
      const profile = profileId ? trafficProfiles.get(profileId) : undefined

      let avg = 0
      let peak = 0
      if (profile) {
        avg = profile.avgBandwidthMbps * profile.concurrencyFactor
        peak = profile.peakBandwidthMbps * profile.concurrencyFactor
      } else if (typeof data.trafficProfileAvgMbps === 'number') {
        avg = data.trafficProfileAvgMbps
        peak = (data.trafficProfilePeakMbps as number | undefined) ?? avg * 5
      }

      deviceAvg.set(node.id, avg)
      devicePeak.set(node.id, peak)
    }

    // Calculate link utilization for each edge
    const linkUtilization: LinkUtilization[] = []
    const overloadedEdgeIds: string[] = []
    const atRiskEdgeIds: string[] = []

    for (const edge of topology.edges) {
      const data = edge.data as Record<string, unknown>
      const speed = parseLinkSpeed(data.speed as string | undefined)

      // Aggregate all traffic flowing through this link
      // Simple model: endpoint devices on each side of the edge contribute their bandwidth
      const sourceNode = topology.nodes.find(n => n.id === edge.source)
      const targetNode = topology.nodes.find(n => n.id === edge.target)

      const sourceAvg = deviceAvg.get(edge.source) ?? 0
      const sourcePeak = devicePeak.get(edge.source) ?? 0
      const targetAvg = deviceAvg.get(edge.target) ?? 0
      const targetPeak = devicePeak.get(edge.target) ?? 0

      // For switch uplinks: aggregate downstream traffic
      let aggAvg = sourceAvg + targetAvg
      let aggPeak = sourcePeak + targetPeak

      // If source is a switch/router, aggregate all connected endpoint devices
      if (sourceNode && ['switch-l2', 'switch-l3', 'router'].includes(sourceNode.type as string)) {
        const downstreamEdges = topology.edges.filter(e => e.id !== edge.id && (e.source === edge.source || e.target === edge.source))
        for (const de of downstreamEdges) {
          const peerId = de.source === edge.source ? de.target : de.source
          const peerNode = topology.nodes.find(n => n.id === peerId)
          if (peerNode && !['switch-l2', 'switch-l3', 'router', 'firewall', 'firewall-edge'].includes(peerNode.type as string)) {
            aggAvg += (deviceAvg.get(peerId) ?? 0) * 0.5
            aggPeak += (devicePeak.get(peerId) ?? 0) * 0.5
          }
        }
      }

      const avgPct = speed > 0 ? Math.min((aggAvg / speed) * 100, 100) : 0
      const peakPct = speed > 0 ? Math.min((aggPeak / speed) * 100, 100) : 0

      let status: LinkUtilization['status'] = 'ok'
      if (peakPct > 90) { status = 'critical'; overloadedEdgeIds.push(edge.id) }
      else if (peakPct > 80) { status = 'warning'; atRiskEdgeIds.push(edge.id) }
      else if (peakPct > 60) status = 'watch'

      linkUtilization.push({
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        linkSpeedMbps: speed,
        avgLoadMbps: Math.round(aggAvg * 10) / 10,
        peakLoadMbps: Math.round(aggPeak * 10) / 10,
        avgUtilizationPct: Math.round(avgPct * 10) / 10,
        peakUtilizationPct: Math.round(peakPct * 10) / 10,
        status,
      })
    }

    // Find bottlenecks (top overloaded links)
    const bottlenecks: CapacityBottleneck[] = linkUtilization
      .filter(l => l.peakUtilizationPct > 70)
      .sort((a, b) => b.peakUtilizationPct - a.peakUtilizationPct)
      .slice(0, 5)
      .map(l => {
        const srcNode = topology.nodes.find(n => n.id === l.sourceNodeId)
        const tgtNode = topology.nodes.find(n => n.id === l.targetNodeId)
        const srcLabel = (srcNode?.data as Record<string, unknown>)?.label ?? l.sourceNodeId
        const tgtLabel = (tgtNode?.data as Record<string, unknown>)?.label ?? l.targetNodeId
        const nextSpeed = l.linkSpeedMbps >= 10000 ? '100G' : l.linkSpeedMbps >= 1000 ? '10G' : '1G'
        return {
          edgeId: l.edgeId,
          description: `Link ${srcLabel} ↔ ${tgtLabel} (${l.linkSpeedMbps >= 1000 ? l.linkSpeedMbps / 1000 + 'G' : l.linkSpeedMbps + 'M'}) at ${l.peakUtilizationPct}% peak utilization`,
          peakUtilizationPct: l.peakUtilizationPct,
          recommendation: `Upgrade to ${nextSpeed} or add a second parallel link (LACP bond) to double effective bandwidth`,
        }
      })

    // QoS requirements
    const qosRequirements: QosRequirement[] = []
    const voipNodes = topology.nodes.filter(n => n.type === 'voip-phone' || (n.data as Record<string, unknown>).trafficProfileId === 'tp-voip')
    if (voipNodes.length > 0) {
      const saturatedLinks = linkUtilization.filter(l => l.peakUtilizationPct > 60)
      if (saturatedLinks.length > 0) {
        qosRequirements.push({
          nodeIds: voipNodes.map(n => n.id),
          trafficType: 'voip',
          recommendation: 'Mark VoIP traffic as DSCP EF (Expedited Forwarding) on all switches and routers. Without QoS, call quality degrades when links are above 60% peak utilization.',
          priority: 'critical',
        })
      }
    }

    const cameraNodes = topology.nodes.filter(n => n.type === 'camera')
    if (cameraNodes.length > 0) {
      qosRequirements.push({
        nodeIds: cameraNodes.map(n => n.id),
        trafficType: 'video-surveillance',
        recommendation: 'Place IP cameras on a dedicated VLAN with a separate uplink to the NVR/DVR. Camera traffic is continuous and competes with general office traffic without isolation.',
        priority: 'high',
      })
    }

    const totalAvg = Array.from(deviceAvg.values()).reduce((a, b) => a + b, 0)
    const totalPeak = Array.from(devicePeak.values()).reduce((a, b) => a + b, 0)

    return {
      linkUtilization,
      bottlenecks,
      qosRequirements,
      totalBandwidthAvgMbps: Math.round(totalAvg * 10) / 10,
      totalBandwidthPeakMbps: Math.round(totalPeak * 10) / 10,
      overloadedEdgeIds,
      atRiskEdgeIds,
    }
  }
}
