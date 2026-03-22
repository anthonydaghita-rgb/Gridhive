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

export function runServiceRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes } = topology

  // NO_DHCP_SERVER: no device with dhcpServer=true on any subnet
  const hasDhcp = nodes.some(n => n.data.dhcpServer === true)
  const hasEndDevices = nodes.some(n =>
    ['workstation', 'server', 'printer', 'voip-phone', 'camera'].includes(n.type)
  )

  if (!hasDhcp && hasEndDevices) {
    results.push(makeResult(
      'info',
      'NO_DHCP_SERVER',
      'No DHCP Server Configured',
      'No device is configured as a DHCP server. End devices will require static IP configuration.',
      'Configure DHCP on a server, firewall, or router to automate IP assignment.',
      [],
    ))
  }

  // NO_DNS_SERVER: no device with dnsServer=true
  const hasDns = nodes.some(n => n.data.dnsServer === true)
  if (!hasDns && hasEndDevices) {
    results.push(makeResult(
      'info',
      'NO_DNS_SERVER',
      'No DNS Server Configured',
      'No device is configured as a DNS server. Name resolution will rely on external DNS or manual configuration.',
      'Configure a DNS server or ensure devices point to an external DNS resolver.',
      [],
    ))
  }

  return results
}
