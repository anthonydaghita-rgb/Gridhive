import type { TopologySnapshot, DeviceNode } from '@gridhive/shared'
import type { ComplianceReport, ComplianceViolation, ComplianceCheck } from '@gridhive/shared'

const REFERENCE = 'https://www.aicpa.org/resources/article/soc-2-attestation'

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

function isServer(node: DeviceNode): boolean {
  return node.type === 'server' || node.type === 'nas'
}

function isWorkstation(node: DeviceNode): boolean {
  return node.type === 'workstation'
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

export class SOC2Framework {
  readonly id = 'soc2'
  readonly name = 'SOC 2 Type II'
  readonly version = 'AICPA Trust Services Criteria (2024)'

  check(topology: TopologySnapshot): ComplianceReport {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceViolation[] = []
    const passed: ComplianceCheck[] = []

    const servers = topology.nodes.filter(isServer)
    const workstations = topology.nodes.filter(isWorkstation)

    // SOC2-NET-001: Server isolation from workstations
    if (servers.length === 0 || workstations.length === 0) {
      passed.push(makeCheck(
        'SOC2-NET-001',
        'SOC2-NET-001',
        'CC6.1 - Logical Access Security',
        'Server isolation from workstations',
        'Not applicable: no servers or no workstations detected.',
      ))
    } else {
      const serverVlans = new Set(servers.map(n => n.data.vlanId).filter(v => v !== undefined))
      const workstationVlans = new Set(workstations.map(n => n.data.vlanId).filter(v => v !== undefined))
      const overlap = [...serverVlans].some(v => workstationVlans.has(v))

      if (!overlap && serverVlans.size > 0 && workstationVlans.size > 0) {
        passed.push(makeCheck(
          'SOC2-NET-001',
          'SOC2-NET-001',
          'CC6.1 - Logical Access Security',
          'Server isolation from workstations',
          'Servers and workstations reside on separate VLANs.',
        ))
      } else if (serverVlans.size === 0 || workstationVlans.size === 0) {
        warnings.push(makeViolation(
          'SOC2-NET-001',
          'SOC2-NET-001',
          'CC6.1 - Logical Access Security',
          'Server or workstation VLAN assignment missing',
          'Servers or workstations do not have VLAN IDs assigned. Cannot verify isolation.',
          'Assign VLAN IDs to all servers and workstations to enable proper segmentation verification.',
          'low',
          [...servers.map(n => n.id), ...workstations.map(n => n.id)],
        ))
      } else {
        violations.push(makeViolation(
          'SOC2-NET-001',
          'SOC2-NET-001',
          'CC6.1 - Logical Access Security',
          'Servers and workstations share the same VLAN',
          'SOC 2 requires logical separation between servers and end-user workstations.',
          'Assign servers to a dedicated server VLAN (e.g., VLAN 20) separate from workstation VLANs.',
          'high',
          [...servers.map(n => n.id), ...workstations.map(n => n.id)],
        ))
      }
    }

    // SOC2-NET-002: Firewall between internet and servers
    const internetNode = topology.nodes.find(n => n.type === 'internet')
    if (!internetNode || servers.length === 0) {
      passed.push(makeCheck(
        'SOC2-NET-002',
        'SOC2-NET-002',
        'CC6.6 - Boundary Protection',
        'Firewall between internet and servers',
        'Not applicable: no internet node or no servers detected.',
      ))
    } else {
      const firewalls = topology.nodes.filter(isFirewall)
      const internetNeighborIds = topology.edges
        .filter(e => e.source === internetNode.id || e.target === internetNode.id)
        .map(e => e.source === internetNode.id ? e.target : e.source)

      const firewallAtPerimeter = internetNeighborIds.some(id => {
        return firewalls.some(fw => fw.id === id)
      })

      if (firewallAtPerimeter) {
        passed.push(makeCheck(
          'SOC2-NET-002',
          'SOC2-NET-002',
          'CC6.6 - Boundary Protection',
          'Firewall between internet and servers',
          'A firewall is present at the internet perimeter protecting internal servers.',
        ))
      } else {
        violations.push(makeViolation(
          'SOC2-NET-002',
          'SOC2-NET-002',
          'CC6.6 - Boundary Protection',
          'No firewall at internet perimeter',
          'Servers may be directly reachable from the internet with no firewall in between.',
          'Place a firewall between the internet connection and all internal servers. Restrict inbound access to required services only.',
          'critical',
          [internetNode.id, ...servers.map(n => n.id)],
        ))
      }
    }

    // SOC2-NET-003: HA/redundancy present
    const redundantTypes = new Set(['switch-l2', 'switch-l3', 'router', 'firewall', 'firewall-edge'])
    const infraNodes = topology.nodes.filter(n => redundantTypes.has(n.type))
    const typeCount = new Map<string, number>()
    for (const n of infraNodes) {
      typeCount.set(n.type, (typeCount.get(n.type) ?? 0) + 1)
    }
    const hasHA = [...typeCount.values()].some(count => count >= 2)

    const haNode = topology.nodes.find(n =>
      roleContains(n, 'ha', 'redundant', 'failover', 'cluster') ||
      labelContains(n, 'ha', 'redundant', 'failover', 'standby'),
    )

    if (hasHA || haNode) {
      passed.push(makeCheck(
        'SOC2-NET-003',
        'SOC2-NET-003',
        'A1.2 - Availability - Recovery',
        'HA/redundancy present',
        'High availability or redundant infrastructure is present.',
      ))
    } else {
      warnings.push(makeViolation(
        'SOC2-NET-003',
        'SOC2-NET-003',
        'A1.2 - Availability - Recovery',
        'No high-availability or redundancy detected',
        'SOC 2 Availability criteria require demonstrated recovery capabilities. No HA pairs or redundant devices detected.',
        'Implement HA pairs for critical infrastructure (firewalls, switches, servers). Document failover procedures.',
        'medium',
      ))
    }

    // SOC2-NET-004: All devices have hostname, IP, VLAN
    const incompleteDevices = topology.nodes.filter(n => {
      if (n.type === 'internet') return false
      return !n.data.hostname || !n.data.ipAddress || n.data.vlanId === undefined
    })

    if (incompleteDevices.length === 0) {
      passed.push(makeCheck(
        'SOC2-NET-004',
        'SOC2-NET-004',
        'CC6.1 - Configuration Management',
        'All devices have hostname, IP, and VLAN',
        'All devices have hostname, IP address, and VLAN ID configured.',
      ))
    } else {
      warnings.push(makeViolation(
        'SOC2-NET-004',
        'SOC2-NET-004',
        'CC6.1 - Configuration Management',
        'Devices missing hostname, IP, or VLAN assignment',
        `${incompleteDevices.length} device(s) are missing hostname, IP address, or VLAN ID.`,
        'Complete the configuration of all devices with hostname, IP address, and VLAN assignment to support accurate change management and audit trails.',
        'low',
        incompleteDevices.map(n => n.id),
      ))
    }

    const overallStatus =
      violations.length > 0 ? 'fail' : warnings.length > 0 ? 'warnings' : 'pass'

    const total = violations.length + warnings.length + passed.length
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 100

    return {
      frameworkId: 'soc2',
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
