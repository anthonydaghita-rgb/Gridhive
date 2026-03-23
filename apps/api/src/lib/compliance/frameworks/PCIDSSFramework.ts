import type { TopologySnapshot, DeviceNode } from '@gridhive/shared'
import type { ComplianceReport, ComplianceViolation, ComplianceCheck } from '@gridhive/shared'

const REFERENCE = 'https://www.pcisecuritystandards.org/document_library/'

const ENCRYPTED_PROTOCOLS = new Set([
  'ssl-vpn',
  'wireguard',
  'site-to-site-vpn',
  'tls',
  'https',
])

function roleContains(node: DeviceNode, ...terms: string[]): boolean {
  const role = (node.data.role ?? '').toLowerCase()
  return terms.some(t => role.includes(t))
}

function labelContains(node: DeviceNode, ...terms: string[]): boolean {
  const label = (node.data.label ?? '').toLowerCase()
  return terms.some(t => label.includes(t))
}

function isCDENode(node: DeviceNode): boolean {
  return (
    node.data.deviceType === 'workstation' && roleContains(node, 'pos', 'payment', 'cardholder') ||
    roleContains(node, 'pos', 'payment', 'cardholder-data', 'cde') ||
    labelContains(node, 'pos', 'payment', 'cardholder', 'cde')
  )
}

function isAP(node: DeviceNode): boolean {
  return node.type === 'wireless-ap'
}

function isFirewall(node: DeviceNode): boolean {
  return node.type === 'firewall' || node.type === 'firewall-edge'
}

function isDMZNode(node: DeviceNode): boolean {
  return (
    roleContains(node, 'dmz', 'demilitarized') ||
    labelContains(node, 'dmz') ||
    node.data.vlanId === 10
  )
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

export class PCIDSSFramework {
  readonly id = 'pci-dss'
  readonly name = 'PCI DSS'
  readonly version = 'v4.0.1'

  check(topology: TopologySnapshot): ComplianceReport {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceViolation[] = []
    const passed: ComplianceCheck[] = []

    const cdeNodes = topology.nodes.filter(isCDENode)
    const hasCDE = cdeNodes.length > 0

    // PCI-NET-001: POS/payment terminals on dedicated VLAN
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-001',
        'PCI-NET-001',
        'Req 1.3 - Network Access Controls',
        'POS/payment terminals on dedicated VLAN',
        'Not applicable: no POS or payment terminals detected.',
      ))
    } else {
      const cdeVlans = new Set(cdeNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const nonCdeVlans = new Set(
        topology.nodes
          .filter(n => !isCDENode(n))
          .map(n => n.data.vlanId)
          .filter(v => v !== undefined),
      )
      const isolated = cdeNodes.every(n => {
        const vlan = n.data.vlanId
        return vlan !== undefined && !nonCdeVlans.has(vlan)
      })
      if (isolated && cdeVlans.size > 0) {
        passed.push(makeCheck(
          'PCI-NET-001',
          'PCI-NET-001',
          'Req 1.3 - Network Access Controls',
          'POS/payment terminals on dedicated VLAN',
          'CDE nodes are on dedicated VLAN(s) not shared with other devices.',
        ))
      } else {
        violations.push(makeViolation(
          'PCI-NET-001',
          'PCI-NET-001',
          'Req 1.3 - Network Access Controls',
          'POS/payment terminals not isolated on a dedicated VLAN',
          'PCI-DSS requires cardholder data environment (CDE) systems to be on isolated VLANs.',
          'Assign all POS terminals and payment systems to a dedicated CDE VLAN and block inter-VLAN access from non-CDE segments.',
          'critical',
          cdeNodes.map(n => n.id),
        ))
      }
    }

    // PCI-NET-002: Firewall between CDE and all other VLANs
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-002',
        'PCI-NET-002',
        'Req 1.2 - Firewall Requirements',
        'Firewall between CDE and all other VLANs',
        'Not applicable: no CDE nodes detected.',
      ))
    } else {
      const cdeNodeIds = new Set(cdeNodes.map(n => n.id))
      const firewallPresent = topology.edges.some(e => {
        const srcInCDE = cdeNodeIds.has(e.source)
        const tgtInCDE = cdeNodeIds.has(e.target)
        if (srcInCDE && !tgtInCDE) {
          const neighbor = topology.nodes.find(n => n.id === e.target)
          return neighbor ? isFirewall(neighbor) : false
        }
        if (tgtInCDE && !srcInCDE) {
          const neighbor = topology.nodes.find(n => n.id === e.source)
          return neighbor ? isFirewall(neighbor) : false
        }
        return false
      })
      if (firewallPresent) {
        passed.push(makeCheck(
          'PCI-NET-002',
          'PCI-NET-002',
          'Req 1.2 - Firewall Requirements',
          'Firewall between CDE and all other VLANs',
          'A firewall is present adjacent to CDE nodes.',
        ))
      } else {
        violations.push(makeViolation(
          'PCI-NET-002',
          'PCI-NET-002',
          'Req 1.2 - Firewall Requirements',
          'No firewall between CDE and other VLANs',
          'PCI-DSS requires a firewall to control all traffic into and out of the CDE.',
          'Place a firewall between the CDE VLAN and all other network segments.',
          'critical',
          cdeNodes.map(n => n.id),
        ))
      }
    }

    // PCI-NET-003: DMZ for internet-facing systems
    const internetNode = topology.nodes.find(n => n.type === 'internet')
    const dmzNode = topology.nodes.find(isDMZNode)
    if (!internetNode) {
      passed.push(makeCheck(
        'PCI-NET-003',
        'PCI-NET-003',
        'Req 1.3 - Network Access Controls',
        'DMZ for internet-facing systems',
        'Not applicable: no internet node detected.',
      ))
    } else if (dmzNode) {
      passed.push(makeCheck(
        'PCI-NET-003',
        'PCI-NET-003',
        'Req 1.3 - Network Access Controls',
        'DMZ for internet-facing systems',
        'A DMZ segment is present for internet-facing systems.',
      ))
    } else {
      warnings.push(makeViolation(
        'PCI-NET-003',
        'PCI-NET-003',
        'Req 1.3 - Network Access Controls',
        'No DMZ detected for internet-facing systems',
        'Internet-facing systems must reside in a DMZ to limit exposure to the internal network.',
        'Create a DMZ VLAN and place internet-facing servers (web, proxy, gateway) in it with appropriate firewall rules.',
        'high',
        internetNode ? [internetNode.id] : [],
      ))
    }

    // PCI-NET-004: Encrypted protocol on payment connections
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-004',
        'PCI-NET-004',
        'Req 4.2 - Protect Data in Transit',
        'Encrypted protocol on payment connections',
        'Not applicable: no CDE nodes detected.',
      ))
    } else {
      const cdeNodeIds = new Set(cdeNodes.map(n => n.id))
      const cdeEdges = topology.edges.filter(e => cdeNodeIds.has(e.source) || cdeNodeIds.has(e.target))
      const wanOrVpnCdeEdges = cdeEdges.filter(
        e => e.data.mediaType === 'wan' || e.data.mediaType === 'vpn',
      )
      if (wanOrVpnCdeEdges.length === 0) {
        passed.push(makeCheck(
          'PCI-NET-004',
          'PCI-NET-004',
          'Req 4.2 - Protect Data in Transit',
          'Encrypted protocol on payment connections',
          'No external WAN connections from CDE nodes detected.',
        ))
      } else {
        const unencrypted = wanOrVpnCdeEdges.filter(e => {
          const proto = (e.data.protocol ?? '').toLowerCase()
          const protocols: string[] = Array.isArray(e.data.protocols)
            ? (e.data.protocols as string[]).map((p: string) => p.toLowerCase())
            : []
          return !ENCRYPTED_PROTOCOLS.has(proto) && !protocols.some(p => ENCRYPTED_PROTOCOLS.has(p))
        })
        if (unencrypted.length === 0) {
          passed.push(makeCheck(
            'PCI-NET-004',
            'PCI-NET-004',
            'Req 4.2 - Protect Data in Transit',
            'Encrypted protocol on payment connections',
            'All CDE WAN connections use encrypted protocols.',
          ))
        } else {
          violations.push(makeViolation(
            'PCI-NET-004',
            'PCI-NET-004',
            'Req 4.2 - Protect Data in Transit',
            'Unencrypted connections from CDE nodes',
            `${unencrypted.length} CDE connection(s) do not use an encrypted transport protocol.`,
            'Enforce TLS/SSL or VPN on all connections transmitting cardholder data.',
            'critical',
            cdeNodes.map(n => n.id),
            unencrypted.map(e => e.id),
          ))
        }
      }
    }

    // PCI-NET-005: No AP bridging to CDE VLAN
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-005',
        'PCI-NET-005',
        'Req 1.3 - Network Access Controls',
        'No AP bridging to CDE VLAN',
        'Not applicable: no CDE nodes detected.',
      ))
    } else {
      const cdeVlans = new Set(cdeNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const apOnCde = topology.nodes.filter(n => {
        if (!isAP(n)) return false
        return n.data.vlanId !== undefined && cdeVlans.has(n.data.vlanId)
      })
      if (apOnCde.length === 0) {
        passed.push(makeCheck(
          'PCI-NET-005',
          'PCI-NET-005',
          'Req 1.3 - Network Access Controls',
          'No AP bridging to CDE VLAN',
          'No wireless access points are bridged to the CDE VLAN.',
        ))
      } else {
        violations.push(makeViolation(
          'PCI-NET-005',
          'PCI-NET-005',
          'Req 1.3 - Network Access Controls',
          'Wireless AP bridged to CDE VLAN',
          'Wireless access points must not be directly bridged to CDE VLANs.',
          'Remove APs from the CDE VLAN. If wireless POS is required, use a dedicated encrypted wireless network with firewall separation.',
          'critical',
          apOnCde.map(n => n.id),
        ))
      }
    }

    // PCI-NET-006: All CDE components have hostname and IP
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-006',
        'PCI-NET-006',
        'Req 12.3 - Asset Inventory',
        'All CDE components have hostname and IP',
        'Not applicable: no CDE nodes detected.',
      ))
    } else {
      const incomplete = cdeNodes.filter(n => !n.data.hostname || !n.data.ipAddress)
      if (incomplete.length === 0) {
        passed.push(makeCheck(
          'PCI-NET-006',
          'PCI-NET-006',
          'Req 12.3 - Asset Inventory',
          'All CDE components have hostname and IP',
          'All CDE nodes have hostname and IP address configured.',
        ))
      } else {
        warnings.push(makeViolation(
          'PCI-NET-006',
          'PCI-NET-006',
          'Req 12.3 - Asset Inventory',
          'CDE components missing hostname or IP address',
          `${incomplete.length} CDE node(s) are missing hostname or IP address.`,
          'Ensure all CDE components have a documented hostname and static IP address.',
          'medium',
          incomplete.map(n => n.id),
        ))
      }
    }

    // PCI-NET-007: All APs using WPA2 or WPA3
    const allAPs = topology.nodes.filter(isAP)
    if (allAPs.length === 0) {
      passed.push(makeCheck(
        'PCI-NET-007',
        'PCI-NET-007',
        'Req 4.3 - Wireless Security',
        'All APs using WPA2 or WPA3',
        'Not applicable: no wireless access points detected.',
      ))
    } else {
      const weakAPs = allAPs.filter(n => {
        const notes = (n.data.notes ?? '').toLowerCase()
        const os = (n.data.os ?? '').toLowerCase()
        return notes.includes('wep') || notes.includes('wpa ') || os.includes('wep') || os.includes('wpa ')
      })
      if (weakAPs.length === 0) {
        passed.push(makeCheck(
          'PCI-NET-007',
          'PCI-NET-007',
          'Req 4.3 - Wireless Security',
          'All APs using WPA2 or WPA3',
          'No APs with weak wireless security (WEP/WPA) detected.',
        ))
      } else {
        violations.push(makeViolation(
          'PCI-NET-007',
          'PCI-NET-007',
          'Req 4.3 - Wireless Security',
          'APs using weak wireless encryption',
          `${weakAPs.length} access point(s) may be using WEP or WPA (TKIP) which are prohibited by PCI-DSS.`,
          'Upgrade all access points to WPA2-AES or WPA3.',
          'high',
          weakAPs.map(n => n.id),
        ))
      }
    }

    // PCI-NET-008: Isolation simulation validation for CDE boundaries
    if (!hasCDE) {
      passed.push(makeCheck(
        'PCI-NET-008',
        'PCI-NET-008',
        'Req 1.4 - CDE Boundary Controls',
        'Isolation simulation validation for CDE boundaries',
        'Not applicable: no CDE nodes detected.',
      ))
    } else {
      const cdeVlans = new Set(cdeNodes.map(n => n.data.vlanId).filter(v => v !== undefined))
      const nonCdeNodes = topology.nodes.filter(n => {
        if (isCDENode(n)) return false
        if (isFirewall(n)) return false
        return n.data.vlanId !== undefined && !cdeVlans.has(n.data.vlanId)
      })
      // Static check: look for direct edges between CDE and non-CDE non-firewall nodes
      const cdeNodeIds = new Set(cdeNodes.map(n => n.id))
      const nonCdeNodeIds = new Set(nonCdeNodes.map(n => n.id))
      const directBreaches = topology.edges.filter(
        e =>
          (cdeNodeIds.has(e.source) && nonCdeNodeIds.has(e.target)) ||
          (cdeNodeIds.has(e.target) && nonCdeNodeIds.has(e.source)),
      )
      if (directBreaches.length === 0) {
        passed.push(makeCheck(
          'PCI-NET-008',
          'PCI-NET-008',
          'Req 1.4 - CDE Boundary Controls',
          'Isolation simulation validation for CDE boundaries',
          'No direct connections detected between CDE and non-CDE segments.',
        ))
      } else {
        violations.push(makeViolation(
          'PCI-NET-008',
          'PCI-NET-008',
          'Req 1.4 - CDE Boundary Controls',
          'Direct connection between CDE and non-CDE segments detected',
          `${directBreaches.length} direct edge(s) found between CDE nodes and non-CDE/non-firewall nodes.`,
          'Remove direct connections between CDE and non-CDE segments. All traffic must pass through a firewall.',
          'critical',
          cdeNodes.map(n => n.id),
          directBreaches.map(e => e.id),
        ))
      }
    }

    const overallStatus =
      violations.length > 0 ? 'fail' : warnings.length > 0 ? 'warnings' : 'pass'

    const total = violations.length + warnings.length + passed.length
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 100

    return {
      frameworkId: 'pci-dss',
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
