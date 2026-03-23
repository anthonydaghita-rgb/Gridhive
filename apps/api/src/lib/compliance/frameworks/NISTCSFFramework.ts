import type { TopologySnapshot, DeviceNode } from '@gridhive/shared'
import type { ComplianceReport, ComplianceViolation, ComplianceCheck } from '@gridhive/shared'

const REFERENCE = 'https://www.nist.gov/cyberframework'

const ENCRYPTED_WAN_PROTOCOLS = new Set([
  'ssl-vpn',
  'wireguard',
  'site-to-site-vpn',
])

function roleContains(node: DeviceNode, ...terms: string[]): boolean {
  const role = (node.data.role ?? '').toLowerCase()
  return terms.some(t => role.includes(t))
}

function labelContains(node: DeviceNode, ...terms: string[]): boolean {
  const label = (node.data.label ?? '').toLowerCase()
  return terms.some(t => label.includes(t))
}

function isFirewall(node: DeviceNode): boolean {
  return node.type === 'firewall' || node.type === 'firewall-edge'
}

function makeViolation(
  id: string,
  requirementId: string,
  requirementName: string,
  title: string,
  description: string,
  remediation: string,
  severity: ComplianceViolation['severity'],
  affectedNodeIds: string[] = [],
  affectedEdgeIds: string[] = [],
): ComplianceViolation {
  return {
    id,
    severity,
    requirementId,
    requirementName,
    title,
    description,
    remediation,
    affectedNodeIds,
    affectedEdgeIds,
    reference: REFERENCE,
  }
}

function makeCheck(
  id: string,
  requirementId: string,
  requirementName: string,
  title: string,
  description: string,
): ComplianceCheck {
  return { id, requirementId, requirementName, title, description }
}

export class NISTCSFFramework {
  readonly id = 'nist-csf'
  readonly name = 'NIST Cybersecurity Framework'
  readonly version = 'CSF 2.0'

  check(topology: TopologySnapshot): ComplianceReport {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceViolation[] = []
    const passed: ComplianceCheck[] = []

    // NIST-NET-001: Network segmentation (3+ VLANs)
    const distinctVlans = new Set(
      topology.nodes.map(n => n.data.vlanId).filter(v => v !== undefined),
    )
    if (distinctVlans.size >= 3) {
      passed.push(makeCheck(
        'NIST-NET-001',
        'NIST-NET-001',
        'PR.AC-5 - Network Integrity',
        'Network segmentation (3+ VLANs)',
        `${distinctVlans.size} distinct VLANs detected, satisfying segmentation requirement.`,
      ))
    } else {
      violations.push(makeViolation(
        'NIST-NET-001',
        'NIST-NET-001',
        'PR.AC-5 - Network Integrity',
        'Insufficient network segmentation',
        `Only ${distinctVlans.size} distinct VLAN(s) detected. NIST CSF recommends at least 3 network segments.`,
        'Segment the network into at least 3 VLANs to limit lateral movement in the event of a compromise.',
        'medium',
      ))
    }

    // NIST-NET-002: Asset inventory complete (all devices have hostname + IP)
    const incompleteAssets = topology.nodes.filter(n => {
      if (n.type === 'internet') return false
      return !n.data.hostname || !n.data.ipAddress
    })
    if (incompleteAssets.length === 0) {
      passed.push(makeCheck(
        'NIST-NET-002',
        'NIST-NET-002',
        'ID.AM-1 - Asset Management',
        'Asset inventory complete',
        'All devices have hostname and IP address configured.',
      ))
    } else {
      warnings.push(makeViolation(
        'NIST-NET-002',
        'NIST-NET-002',
        'ID.AM-1 - Asset Management',
        'Incomplete asset inventory',
        `${incompleteAssets.length} device(s) are missing hostname or IP address.`,
        'Ensure every device has a documented hostname and IP address to maintain an accurate asset inventory.',
        'low',
        incompleteAssets.map(n => n.id),
      ))
    }

    // NIST-NET-003: Remote access uses VPN
    const vpnOrSslEdges = topology.edges.filter(e => {
      const proto = (e.data.protocol ?? '').toLowerCase()
      const protocols: string[] = Array.isArray(e.data.protocols)
        ? (e.data.protocols as string[]).map((p: string) => p.toLowerCase())
        : []
      const isWan = e.data.mediaType === 'wan' || e.data.mediaType === 'vpn'
      if (!isWan) return false
      return (
        ENCRYPTED_WAN_PROTOCOLS.has(proto) ||
        protocols.some(p => ENCRYPTED_WAN_PROTOCOLS.has(p))
      )
    })

    const vpnNode = topology.nodes.find(n =>
      roleContains(n, 'vpn', 'remote-access', 'ssl-vpn', 'wireguard') ||
      labelContains(n, 'vpn', 'remote access'),
    )

    const wanEdges = topology.edges.filter(e => e.data.mediaType === 'wan' || e.data.mediaType === 'vpn')
    if (wanEdges.length === 0) {
      passed.push(makeCheck(
        'NIST-NET-003',
        'NIST-NET-003',
        'PR.AC-3 - Remote Access Management',
        'Remote access uses VPN',
        'No WAN or remote access connections detected.',
      ))
    } else if (vpnNode || vpnOrSslEdges.length > 0) {
      passed.push(makeCheck(
        'NIST-NET-003',
        'NIST-NET-003',
        'PR.AC-3 - Remote Access Management',
        'Remote access uses VPN',
        'VPN or encrypted remote access is present in the topology.',
      ))
    } else {
      warnings.push(makeViolation(
        'NIST-NET-003',
        'NIST-NET-003',
        'PR.AC-3 - Remote Access Management',
        'No VPN detected for remote access',
        'WAN connections are present but no VPN or encrypted remote access solution was detected.',
        'Deploy a VPN solution for all remote access. Use SSL-VPN, WireGuard, or IPSec.',
        'medium',
        [],
        wanEdges.map(e => e.id),
      ))
    }

    // NIST-NET-004: Firewall between internet and internal
    const internetNode = topology.nodes.find(n => n.type === 'internet')
    if (!internetNode) {
      passed.push(makeCheck(
        'NIST-NET-004',
        'NIST-NET-004',
        'PR.AC-5 - Network Integrity',
        'Firewall between internet and internal',
        'No internet node detected in topology.',
      ))
    } else {
      const internetNeighbors = topology.edges
        .filter(e => e.source === internetNode.id || e.target === internetNode.id)
        .map(e => e.source === internetNode.id ? e.target : e.source)

      const firewallAtPerimeter = internetNeighbors.some(id => {
        const node = topology.nodes.find(n => n.id === id)
        return node ? isFirewall(node) : false
      })

      if (firewallAtPerimeter) {
        passed.push(makeCheck(
          'NIST-NET-004',
          'NIST-NET-004',
          'PR.AC-5 - Network Integrity',
          'Firewall between internet and internal',
          'A firewall is directly connected to the internet node.',
        ))
      } else {
        violations.push(makeViolation(
          'NIST-NET-004',
          'NIST-NET-004',
          'PR.AC-5 - Network Integrity',
          'No firewall at internet perimeter',
          'The internet node is not directly connected to a firewall. Internal systems may be directly exposed.',
          'Add a firewall or edge firewall device between the internet connection and all internal network segments.',
          'critical',
          [internetNode.id],
        ))
      }
    }

    // NIST-NET-005: WAN connections using encrypted protocols
    const allWanEdges = topology.edges.filter(e => e.data.mediaType === 'wan' || e.data.mediaType === 'vpn')
    if (allWanEdges.length === 0) {
      passed.push(makeCheck(
        'NIST-NET-005',
        'NIST-NET-005',
        'PR.DS-2 - Data-in-Transit Protection',
        'WAN connections using encrypted protocols',
        'No WAN connections detected.',
      ))
    } else {
      const unencryptedWan = allWanEdges.filter(e => {
        const proto = (e.data.protocol ?? '').toLowerCase()
        const protocols: string[] = Array.isArray(e.data.protocols)
          ? (e.data.protocols as string[]).map((p: string) => p.toLowerCase())
          : []
        return !ENCRYPTED_WAN_PROTOCOLS.has(proto) && !protocols.some(p => ENCRYPTED_WAN_PROTOCOLS.has(p))
      })
      if (unencryptedWan.length === 0) {
        passed.push(makeCheck(
          'NIST-NET-005',
          'NIST-NET-005',
          'PR.DS-2 - Data-in-Transit Protection',
          'WAN connections using encrypted protocols',
          'All WAN connections use encrypted protocols.',
        ))
      } else {
        warnings.push(makeViolation(
          'NIST-NET-005',
          'NIST-NET-005',
          'PR.DS-2 - Data-in-Transit Protection',
          'Unencrypted WAN connections detected',
          `${unencryptedWan.length} WAN connection(s) do not use an encrypted protocol.`,
          'Configure all WAN links to use SSL-VPN, WireGuard, or IPSec to protect data in transit.',
          'medium',
          [],
          unencryptedWan.map(e => e.id),
        ))
      }
    }

    // NIST-NET-006: Monitoring server present
    const monitoringNode = topology.nodes.find(n =>
      roleContains(n, 'syslog', 'logging', 'monitoring', 'siem', 'nms', 'snmp') ||
      labelContains(n, 'syslog', 'splunk', 'monitoring', 'siem', 'graylog', 'nms'),
    )
    if (monitoringNode) {
      passed.push(makeCheck(
        'NIST-NET-006',
        'NIST-NET-006',
        'DE.CM-1 - Network Monitoring',
        'Monitoring server present',
        `Monitoring/logging infrastructure detected: ${monitoringNode.data.label || monitoringNode.data.hostname}.`,
      ))
    } else {
      warnings.push(makeViolation(
        'NIST-NET-006',
        'NIST-NET-006',
        'DE.CM-1 - Network Monitoring',
        'No monitoring server detected',
        'No syslog, SIEM, or network monitoring server was found. Continuous monitoring is a core NIST CSF Detect function.',
        'Deploy a centralized monitoring solution (SIEM, syslog server, or NMS) and configure all devices to send logs and traps.',
        'medium',
      ))
    }

    // NIST-NET-007: Redundancy present
    const redundantTypes = new Set(['switch-l2', 'switch-l3', 'router', 'firewall', 'firewall-edge'])
    const infraNodes = topology.nodes.filter(n => redundantTypes.has(n.type))
    const typeCount = new Map<string, number>()
    for (const n of infraNodes) {
      typeCount.set(n.type, (typeCount.get(n.type) ?? 0) + 1)
    }
    const hasRedundancy = [...typeCount.values()].some(count => count >= 2)

    if (hasRedundancy) {
      passed.push(makeCheck(
        'NIST-NET-007',
        'NIST-NET-007',
        'PR.IP-8 - Resilience',
        'Redundancy present',
        'At least one infrastructure device type has 2 or more instances, indicating redundancy.',
      ))
    } else {
      warnings.push(makeViolation(
        'NIST-NET-007',
        'NIST-NET-007',
        'PR.IP-8 - Resilience',
        'No redundancy detected in network infrastructure',
        'No redundant switches, routers, or firewalls were detected. Single points of failure exist.',
        'Add redundant network infrastructure (dual firewalls, stacked switches, redundant uplinks) to improve resilience.',
        'low',
      ))
    }

    const overallStatus =
      violations.length > 0 ? 'fail' : warnings.length > 0 ? 'warnings' : 'pass'

    const total = violations.length + warnings.length + passed.length
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 100

    return {
      frameworkId: 'nist-csf',
      frameworkName: this.name,
      frameworkVersion: this.version,
      ranAt: new Date(),
      overallStatus,
      score,
      violations,
      warnings,
      passed,
    }
  }
}
