import type { TopologySnapshot, DeviceNode } from '@gridhive/shared'
import type { ComplianceReport, ComplianceViolation, ComplianceCheck } from '@gridhive/shared'

const REFERENCE = 'https://www.hhs.gov/hipaa/for-professionals/security/index.html'

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

function isClinicalNode(node: DeviceNode): boolean {
  return (
    roleContains(node, 'emr', 'ehr', 'pacs', 'medical', 'clinical') ||
    labelContains(node, 'emr', 'ehr', 'pacs', 'medical', 'clinical')
  )
}

function isMedicalDevice(node: DeviceNode): boolean {
  const dt = node.data.deviceType ?? ''
  return (
    dt.includes('medical') ||
    roleContains(node, 'patient', 'anesthesia', 'infusion', 'medical-device') ||
    labelContains(node, 'patient', 'anesthesia', 'infusion', 'pump', 'monitor')
  )
}

function isFirewall(node: DeviceNode): boolean {
  return node.type === 'firewall' || node.type === 'firewall-edge'
}

function hasFirewallNeighbor(topology: TopologySnapshot, nodeId: string): boolean {
  return topology.edges.some(e => {
    const otherId = e.source === nodeId ? e.target : e.source === nodeId ? e.source : null
    if (otherId === null) {
      if (e.source === nodeId || e.target === nodeId) {
        const neighborId = e.source === nodeId ? e.target : e.source
        const neighbor = topology.nodes.find(n => n.id === neighborId)
        return neighbor ? isFirewall(neighbor) : false
      }
      return false
    }
    return false
  })
}

function getFirewallNeighbors(topology: TopologySnapshot, nodeIds: Set<string>): boolean {
  for (const edge of topology.edges) {
    const srcInSet = nodeIds.has(edge.source)
    const tgtInSet = nodeIds.has(edge.target)
    if (srcInSet && !tgtInSet) {
      const neighbor = topology.nodes.find(n => n.id === edge.target)
      if (neighbor && isFirewall(neighbor)) return true
    }
    if (tgtInSet && !srcInSet) {
      const neighbor = topology.nodes.find(n => n.id === edge.source)
      if (neighbor && isFirewall(neighbor)) return true
    }
  }
  return false
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

export class HIPAAFramework {
  readonly id = 'hipaa'
  readonly name = 'HIPAA Security Rule'
  readonly version = '45 CFR Part 164 (2025 Updates Proposed)'

  check(topology: TopologySnapshot): ComplianceReport {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceViolation[] = []
    const passed: ComplianceCheck[] = []

    const clinicalNodes = topology.nodes.filter(isClinicalNode)
    const medicalDevices = topology.nodes.filter(isMedicalDevice)
    const hasHealthcareDevices = clinicalNodes.length > 0 || medicalDevices.length > 0

    // HIPAA-NET-001: Firewall between EMR/EHR and general LAN
    if (!hasHealthcareDevices) {
      passed.push(makeCheck(
        'HIPAA-NET-001',
        'HIPAA-NET-001',
        '164.312(e)(1) - Transmission Security',
        'Firewall between EMR/EHR and general LAN',
        'Not applicable: no clinical systems detected.',
      ))
    } else {
      const clinicalNodeIds = new Set(clinicalNodes.map(n => n.id))
      const firewallPresent = getFirewallNeighbors(topology, clinicalNodeIds)
      if (firewallPresent) {
        passed.push(makeCheck(
          'HIPAA-NET-001',
          'HIPAA-NET-001',
          '164.312(e)(1) - Transmission Security',
          'Firewall between EMR/EHR and general LAN',
          'A firewall is present adjacent to clinical systems.',
        ))
      } else {
        violations.push(makeViolation(
          'HIPAA-NET-001',
          'HIPAA-NET-001',
          '164.312(e)(1) - Transmission Security',
          'No firewall protecting EMR/EHR systems',
          'Clinical systems (EMR, EHR, PACS) must be separated from the general LAN by a firewall.',
          'Add a firewall between the clinical segment and the general LAN.',
          'critical',
          clinicalNodes.map(n => n.id),
        ))
      }
    }

    // HIPAA-NET-002: Encrypted WAN from clinical segments
    const wanEdges = topology.edges.filter(e => e.data.mediaType === 'wan' || e.data.mediaType === 'vpn')
    if (wanEdges.length === 0) {
      passed.push(makeCheck(
        'HIPAA-NET-002',
        'HIPAA-NET-002',
        '164.312(e)(2)(ii) - Encryption and Decryption',
        'Encrypted WAN from clinical segments',
        'Not applicable: no WAN connections detected.',
      ))
    } else {
      const unencryptedWan = wanEdges.filter(e => {
        const proto = (e.data.protocol ?? '').toLowerCase()
        const protocols: string[] = Array.isArray(e.data.protocols)
          ? (e.data.protocols as string[]).map((p: string) => p.toLowerCase())
          : []
        return !ENCRYPTED_WAN_PROTOCOLS.has(proto) && !protocols.some(p => ENCRYPTED_WAN_PROTOCOLS.has(p))
      })
      if (unencryptedWan.length === 0) {
        passed.push(makeCheck(
          'HIPAA-NET-002',
          'HIPAA-NET-002',
          '164.312(e)(2)(ii) - Encryption and Decryption',
          'Encrypted WAN from clinical segments',
          'All WAN connections use encrypted protocols.',
        ))
      } else {
        violations.push(makeViolation(
          'HIPAA-NET-002',
          'HIPAA-NET-002',
          '164.312(e)(2)(ii) - Encryption and Decryption',
          'Unencrypted WAN connections present',
          `${unencryptedWan.length} WAN connection(s) do not use an encrypted protocol (ssl-vpn, wireguard, site-to-site-vpn).`,
          'Configure all WAN connections to use SSL-VPN, WireGuard, or Site-to-Site VPN.',
          'high',
          [],
          unencryptedWan.map(e => e.id),
        ))
      }
    }

    // HIPAA-NET-003: 802.1X/RADIUS authentication present
    const radiusNode = topology.nodes.find(n =>
      roleContains(n, 'radius', 'nps', 'authentication') ||
      labelContains(n, 'radius', 'nps', '802.1x', '802.1X'),
    )
    if (radiusNode) {
      passed.push(makeCheck(
        'HIPAA-NET-003',
        'HIPAA-NET-003',
        '164.312(d) - Person or Entity Authentication',
        '802.1X/RADIUS authentication present',
        'A RADIUS or NPS authentication server is present in the topology.',
      ))
    } else {
      warnings.push(makeViolation(
        'HIPAA-NET-003',
        'HIPAA-NET-003',
        '164.312(d) - Person or Entity Authentication',
        'No RADIUS/802.1X authentication server detected',
        'HIPAA requires entity authentication controls. A RADIUS or NPS server supporting 802.1X is recommended.',
        'Add a RADIUS or NPS server and configure 802.1X on network switches.',
        'medium',
      ))
    }

    // HIPAA-NET-004: Syslog/logging server reachable
    const syslogNode = topology.nodes.find(n =>
      roleContains(n, 'syslog', 'logging', 'monitoring', 'siem') ||
      labelContains(n, 'syslog', 'logging', 'siem', 'splunk', 'graylog'),
    )
    if (syslogNode) {
      passed.push(makeCheck(
        'HIPAA-NET-004',
        'HIPAA-NET-004',
        '164.312(b) - Audit Controls',
        'Syslog/logging server reachable',
        'A logging or monitoring server is present in the topology.',
      ))
    } else {
      warnings.push(makeViolation(
        'HIPAA-NET-004',
        'HIPAA-NET-004',
        '164.312(b) - Audit Controls',
        'No syslog or logging server detected',
        'HIPAA requires audit controls. A centralized logging server (syslog, SIEM) is required.',
        'Add a syslog or SIEM server and configure all devices to forward logs.',
        'high',
      ))
    }

    // HIPAA-NET-005: Medical devices on separate VLAN
    if (medicalDevices.length === 0) {
      passed.push(makeCheck(
        'HIPAA-NET-005',
        'HIPAA-NET-005',
        '164.312(a)(1) - Access Control',
        'Medical devices on separate VLAN',
        'Not applicable: no medical devices detected.',
      ))
    } else {
      const medicalVlans = new Set(medicalDevices.map(n => n.data.vlanId).filter(v => v !== undefined))
      const nonMedicalVlans = new Set(
        topology.nodes
          .filter(n => !isMedicalDevice(n))
          .map(n => n.data.vlanId)
          .filter(v => v !== undefined),
      )
      const isolated = medicalDevices.every(n => {
        const vlan = n.data.vlanId
        return vlan !== undefined && !nonMedicalVlans.has(vlan)
      })
      if (isolated && medicalVlans.size > 0) {
        passed.push(makeCheck(
          'HIPAA-NET-005',
          'HIPAA-NET-005',
          '164.312(a)(1) - Access Control',
          'Medical devices on separate VLAN',
          'Medical devices are on dedicated VLAN(s) not shared with other devices.',
        ))
      } else {
        violations.push(makeViolation(
          'HIPAA-NET-005',
          'HIPAA-NET-005',
          '164.312(a)(1) - Access Control',
          'Medical devices not isolated on a dedicated VLAN',
          'Medical devices (infusion pumps, patient monitors, anesthesia equipment) must reside on a dedicated VLAN.',
          'Assign all medical devices to a dedicated VLAN (e.g., VLAN 40) separate from general workstations.',
          'high',
          medicalDevices.map(n => n.id),
        ))
      }
    }

    // HIPAA-NET-006: Guest/patient WiFi isolated from clinical
    const guestNodes = topology.nodes.filter(n =>
      roleContains(n, 'guest', 'guest-wifi', 'patient-wifi') ||
      labelContains(n, 'guest', 'patient wifi', 'visitor'),
    )
    if (guestNodes.length === 0 || clinicalNodes.length === 0) {
      passed.push(makeCheck(
        'HIPAA-NET-006',
        'HIPAA-NET-006',
        '164.312(a)(1) - Access Control',
        'Guest/patient WiFi isolated from clinical',
        'Not applicable: no guest WiFi or clinical nodes detected.',
      ))
    } else {
      const guestVlans = new Set(guestNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const clinicalVlans = new Set(clinicalNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const overlap = [...guestVlans].some(v => clinicalVlans.has(v))
      if (!overlap) {
        passed.push(makeCheck(
          'HIPAA-NET-006',
          'HIPAA-NET-006',
          '164.312(a)(1) - Access Control',
          'Guest/patient WiFi isolated from clinical',
          'Guest/patient WiFi VLANs do not overlap with clinical VLANs.',
        ))
      } else {
        violations.push(makeViolation(
          'HIPAA-NET-006',
          'HIPAA-NET-006',
          '164.312(a)(1) - Access Control',
          'Guest WiFi and clinical systems share VLAN',
          'Guest or patient WiFi must be completely isolated from clinical network segments.',
          'Place guest/patient WiFi on a dedicated VLAN and enforce firewall rules to prevent access to clinical systems.',
          'critical',
          [...guestNodes.map(n => n.id), ...clinicalNodes.map(n => n.id)],
        ))
      }
    }

    // HIPAA-NET-007: Dedicated management VLAN
    const hasMgmtVlan = topology.nodes.some(n => n.data.vlanId === 99 || roleContains(n, 'management'))
    if (hasMgmtVlan) {
      passed.push(makeCheck(
        'HIPAA-NET-007',
        'HIPAA-NET-007',
        '164.312(a)(2)(iv) - Automatic Logoff',
        'Dedicated management VLAN',
        'A management VLAN (VLAN 99 or role=management) is present.',
      ))
    } else {
      warnings.push(makeViolation(
        'HIPAA-NET-007',
        'HIPAA-NET-007',
        '164.312(a)(2)(iv) - Automatic Logoff',
        'No dedicated management VLAN detected',
        'A separate management VLAN is recommended to isolate administrative traffic from user data.',
        'Create a dedicated management VLAN (e.g., VLAN 99) and assign all infrastructure management interfaces to it.',
        'medium',
      ))
    }

    // HIPAA-NET-008: At least 3 distinct network zones
    const distinctVlans = new Set(
      topology.nodes.map(n => n.data.vlanId).filter(v => v !== undefined),
    )
    if (distinctVlans.size >= 3) {
      passed.push(makeCheck(
        'HIPAA-NET-008',
        'HIPAA-NET-008',
        '164.312(a)(1) - Access Control',
        'At least 3 distinct network zones',
        `${distinctVlans.size} distinct VLANs detected, meeting the 3-zone minimum.`,
      ))
    } else {
      violations.push(makeViolation(
        'HIPAA-NET-008',
        'HIPAA-NET-008',
        '164.312(a)(1) - Access Control',
        'Insufficient network segmentation',
        `Only ${distinctVlans.size} distinct VLAN(s) detected. HIPAA requires at least 3 distinct network zones (e.g., clinical, management, guest).`,
        'Add VLAN segmentation to create at least 3 network zones: clinical, administrative, and guest/patient.',
        'high',
      ))
    }

    const overallStatus =
      violations.length > 0 ? 'fail' : warnings.length > 0 ? 'warnings' : 'pass'

    const total = violations.length + warnings.length + passed.length
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 100

    return {
      frameworkId: 'hipaa',
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
