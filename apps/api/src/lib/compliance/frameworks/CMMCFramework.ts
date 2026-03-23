import type { TopologySnapshot, DeviceNode } from '@gridhive/shared'
import type { ComplianceReport, ComplianceViolation, ComplianceCheck } from '@gridhive/shared'

const REFERENCE = 'https://www.acq.osd.mil/cmmc/'

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

export class CMMCFramework {
  readonly id = 'cmmc-l2'
  readonly name = 'CMMC Level 2'
  readonly version = 'CMMC 2.0 (32 CFR Part 170)'

  check(topology: TopologySnapshot): ComplianceReport {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceViolation[] = []
    const passed: ComplianceCheck[] = []

    // CMMC-NET-001: Firewall on all external connections
    const internetNode = topology.nodes.find(n => n.type === 'internet')
    if (!internetNode) {
      passed.push(makeCheck(
        'CMMC-NET-001',
        'CMMC-NET-001',
        'SC.L2-3.13.1 - Boundary Protection',
        'Firewall on all external connections',
        'No internet or external connection node detected.',
      ))
    } else {
      const externalNeighborIds = topology.edges
        .filter(e => e.source === internetNode.id || e.target === internetNode.id)
        .map(e => e.source === internetNode.id ? e.target : e.source)

      const firewallAtBoundary = externalNeighborIds.some(id => {
        const node = topology.nodes.find(n => n.id === id)
        return node ? isFirewall(node) : false
      })

      if (firewallAtBoundary) {
        passed.push(makeCheck(
          'CMMC-NET-001',
          'CMMC-NET-001',
          'SC.L2-3.13.1 - Boundary Protection',
          'Firewall on all external connections',
          'A firewall is present at the external boundary.',
        ))
      } else {
        violations.push(makeViolation(
          'CMMC-NET-001',
          'CMMC-NET-001',
          'SC.L2-3.13.1 - Boundary Protection',
          'No firewall at external network boundary',
          'CMMC requires a managed boundary with firewall controls at all external connection points.',
          'Place a firewall between the internet and all internal systems. Implement deny-by-default rules for inbound traffic.',
          'critical',
          [internetNode.id],
        ))
      }
    }

    // CMMC-NET-002: All WAN connections encrypted
    const wanEdges = topology.edges.filter(e => e.data.mediaType === 'wan' || e.data.mediaType === 'vpn')
    if (wanEdges.length === 0) {
      passed.push(makeCheck(
        'CMMC-NET-002',
        'CMMC-NET-002',
        'SC.L2-3.13.8 - Transmission Confidentiality',
        'All WAN connections encrypted',
        'No WAN connections detected.',
      ))
    } else {
      const unencrypted = wanEdges.filter(e => {
        const proto = (e.data.protocol ?? '').toLowerCase()
        const protocols: string[] = Array.isArray(e.data.protocols)
          ? (e.data.protocols as string[]).map((p: string) => p.toLowerCase())
          : []
        return !ENCRYPTED_WAN_PROTOCOLS.has(proto) && !protocols.some(p => ENCRYPTED_WAN_PROTOCOLS.has(p))
      })
      if (unencrypted.length === 0) {
        passed.push(makeCheck(
          'CMMC-NET-002',
          'CMMC-NET-002',
          'SC.L2-3.13.8 - Transmission Confidentiality',
          'All WAN connections encrypted',
          'All WAN connections use encrypted protocols.',
        ))
      } else {
        violations.push(makeViolation(
          'CMMC-NET-002',
          'CMMC-NET-002',
          'SC.L2-3.13.8 - Transmission Confidentiality',
          'Unencrypted WAN connections present',
          `${unencrypted.length} WAN connection(s) do not use an encrypted protocol. CUI may be exposed in transit.`,
          'Enforce encryption on all WAN links. Use SSL-VPN, WireGuard, or IPSec for all connections carrying CUI.',
          'high',
          [],
          unencrypted.map(e => e.id),
        ))
      }
    }

    // CMMC-NET-003: IDS/IPS capability present
    const idsNode = topology.nodes.find(n => {
      const deviceSpecs = (n.data as Record<string, unknown>)
      if (deviceSpecs && typeof deviceSpecs === 'object') {
        const specs = deviceSpecs.specs as Record<string, unknown> | undefined
        if (specs?.idsIpsCapable === true) return true
      }
      return (
        roleContains(n, 'ids', 'ips', 'intrusion') ||
        labelContains(n, 'ids', 'ips', 'intrusion detection', 'intrusion prevention') ||
        roleContains(n, 'utm', 'ngfw')
      )
    })

    if (idsNode) {
      passed.push(makeCheck(
        'CMMC-NET-003',
        'CMMC-NET-003',
        'SI.L2-3.14.6 - Security Alerts',
        'IDS/IPS capability present',
        `IDS/IPS capability detected: ${idsNode.data.label || idsNode.data.hostname}.`,
      ))
    } else {
      warnings.push(makeViolation(
        'CMMC-NET-003',
        'CMMC-NET-003',
        'SI.L2-3.14.6 - Security Alerts',
        'No IDS/IPS capability detected',
        'CMMC Level 2 requires intrusion detection capability. No IDS, IPS, or NGFW with IPS features was found.',
        'Deploy an IDS/IPS system or configure an NGFW with IPS signatures enabled. Monitor alerts for suspicious activity.',
        'medium',
      ))
    }

    // CMMC-NET-004: Audit logging infrastructure
    const auditNode = topology.nodes.find(n =>
      roleContains(n, 'syslog', 'logging', 'monitoring', 'siem', 'audit') ||
      labelContains(n, 'syslog', 'logging', 'siem', 'splunk', 'graylog', 'audit'),
    )
    if (auditNode) {
      passed.push(makeCheck(
        'CMMC-NET-004',
        'CMMC-NET-004',
        'AU.L2-3.3.1 - System Auditing',
        'Audit logging infrastructure',
        `Audit/logging infrastructure detected: ${auditNode.data.label || auditNode.data.hostname}.`,
      ))
    } else {
      violations.push(makeViolation(
        'CMMC-NET-004',
        'CMMC-NET-004',
        'AU.L2-3.3.1 - System Auditing',
        'No audit logging infrastructure detected',
        'CMMC Level 2 requires that audit records be created and retained. No logging or SIEM server found.',
        'Deploy a centralized logging server (syslog, SIEM) and configure all systems and network devices to forward security event logs.',
        'high',
      ))
    }

    // CMMC-NET-005: CUI zone isolation
    const cuiNodes = topology.nodes.filter(n =>
      roleContains(n, 'cui', 'controlled', 'classified', 'sensitive') ||
      labelContains(n, 'cui', 'controlled unclassified'),
    )

    if (cuiNodes.length === 0) {
      passed.push(makeCheck(
        'CMMC-NET-005',
        'CMMC-NET-005',
        'SC.L2-3.13.3 - Role Separation',
        'CUI zone isolation',
        'No CUI-labeled nodes detected in topology.',
      ))
    } else {
      const cuiVlans = new Set(cuiNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const nonCuiVlans = new Set(
        topology.nodes
          .filter(n => !roleContains(n, 'cui', 'controlled') && !labelContains(n, 'cui'))
          .map(n => n.data.vlanId)
          .filter(v => v !== undefined),
      )
      const overlap = [...cuiVlans].some(v => nonCuiVlans.has(v))

      if (!overlap && cuiVlans.size > 0) {
        passed.push(makeCheck(
          'CMMC-NET-005',
          'CMMC-NET-005',
          'SC.L2-3.13.3 - Role Separation',
          'CUI zone isolation',
          'CUI-labeled nodes are on dedicated VLANs not shared with other systems.',
        ))
      } else {
        violations.push(makeViolation(
          'CMMC-NET-005',
          'CMMC-NET-005',
          'SC.L2-3.13.3 - Role Separation',
          'CUI systems not isolated to a dedicated zone',
          'Systems handling Controlled Unclassified Information (CUI) share network segments with non-CUI systems.',
          'Place all CUI systems on a dedicated, isolated VLAN. Enforce firewall rules to control access to CUI systems.',
          'critical',
          cuiNodes.map(n => n.id),
        ))
      }
    }

    const overallStatus =
      violations.length > 0 ? 'fail' : warnings.length > 0 ? 'warnings' : 'pass'

    const total = violations.length + warnings.length + passed.length
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 100

    return {
      frameworkId: 'cmmc-l2',
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
