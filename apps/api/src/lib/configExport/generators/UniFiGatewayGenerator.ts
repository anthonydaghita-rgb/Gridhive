import type { TopologySnapshot, DeviceNode, VendorDeviceProfile, ConfigExportResult } from '@gridhive/shared'

const GATEWAY_JSON_INSTRUCTIONS =
  "Copy config.gateway.json to /usr/lib/unifi/data/sites/default/ on your controller, then force-provision the gateway. For the API script: edit UNIFI_HOST, USERNAME, PASSWORD at the top, then run: bash config-apply.sh"

// ─── helpers ──────────────────────────────────────────────────────────────────

function collectVlans(
  topology: TopologySnapshot,
  device: DeviceNode,
): Map<number, string> {
  const vlanSet = new Map<number, string>()

  const addVlan = (id: number, name?: string) => {
    if (!vlanSet.has(id)) vlanSet.set(id, name || `VLAN${id}`)
  }

  if (device.data.vlanId) addVlan(device.data.vlanId)
  if (Array.isArray(device.data.vlanTrunkPorts)) {
    for (const v of device.data.vlanTrunkPorts) addVlan(v)
  }

  for (const edge of topology.edges) {
    const isConnected = edge.source === device.id || edge.target === device.id
    if (!isConnected) continue
    if (Array.isArray(edge.data.trunkVlans)) {
      for (const v of edge.data.trunkVlans) addVlan(v)
    }
    if (edge.data.vlanTag) addVlan(edge.data.vlanTag)

    const neighborId = edge.source === device.id ? edge.target : edge.source
    const neighbor = topology.nodes.find(n => n.id === neighborId)
    if (neighbor?.data.vlanId) addVlan(neighbor.data.vlanId)
  }

  if (device.data.portMappings) {
    for (const pm of device.data.portMappings) {
      if (pm.vlanId) addVlan(pm.vlanId)
      if (Array.isArray(pm.trunkVlans)) {
        for (const v of pm.trunkVlans) addVlan(v)
      }
    }
  }

  return vlanSet
}

function deriveSubnet(ip: string, prefix: number): string {
  const parts = ip.split('.').map(Number)
  const base = parts.slice(0, 3).join('.')
  return `${base}.0/${prefix}`
}

function deriveGateway(ip: string): string {
  const parts = ip.split('.').map(Number)
  return `${parts[0]}.${parts[1]}.${parts[2]}.1`
}

function deriveRangeStart(ip: string): string {
  const parts = ip.split('.').map(Number)
  return `${parts[0]}.${parts[1]}.${parts[2]}.10`
}

function deriveRangeStop(ip: string): string {
  const parts = ip.split('.').map(Number)
  return `${parts[0]}.${parts[1]}.${parts[2]}.254`
}

// ─── config.gateway.json generator ───────────────────────────────────────────

function generateGatewayJson(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const d = device.data
  const hostname = d.hostname || 'unifi-gw'
  const timezone = (d['timezone'] as string | undefined) || 'UTC'
  const warnings: string[] = []
  const vlanSet = collectVlans(topology, device)

  const lanIp = d.ipAddress || '192.168.1.1'
  const subnetPrefix = d.subnet ? parseInt(d.subnet, 10) : 24
  const lanSubnet = deriveSubnet(lanIp, subnetPrefix)
  const lanGateway = deriveGateway(lanIp)
  const dhcpStart = deriveRangeStart(lanIp)
  const dhcpStop = deriveRangeStop(lanIp)

  // Build DHCP shared-network-name entries
  type DhcpSubnetEntry = {
    'default-router': string
    'dns-server': string[]
    start: string
    stop: string
    lease: string
  }
  type DhcpVlanEntry = { subnet: Record<string, DhcpSubnetEntry> }
  const dhcpNetworks: Record<string, DhcpVlanEntry> = {}

  if (vlanSet.size > 0) {
    let vlanIndex = 0
    for (const [vlanId, vlanName] of vlanSet.entries()) {
      // Use actual IP for first VLAN if available; synthesize for others
      const baseOctet = 10 + vlanIndex
      const vlanIp = vlanIndex === 0 ? lanIp : `10.${baseOctet}.0.1`
      const vlanSubnet = vlanIndex === 0 ? lanSubnet : `10.${baseOctet}.0.0/24`
      const vlanGw = vlanIndex === 0 ? lanGateway : `10.${baseOctet}.0.1`
      const vlanStart = vlanIndex === 0 ? dhcpStart : `10.${baseOctet}.0.10`
      const vlanStop = vlanIndex === 0 ? dhcpStop : `10.${baseOctet}.0.254`
      void vlanIp
      dhcpNetworks[`VLAN_${vlanName.replace(/\s+/g, '_').toUpperCase()}`] = {
        subnet: {
          [vlanSubnet]: {
            'default-router': vlanGw,
            'dns-server': ['8.8.8.8', '8.8.4.4'],
            start: vlanStart,
            stop: vlanStop,
            lease: '86400',
          },
        },
      }
      vlanIndex++
    }
  } else {
    warnings.push('No VLAN information found — using default LAN subnet for DHCP.')
    dhcpNetworks['LAN'] = {
      subnet: {
        [lanSubnet]: {
          'default-router': lanGateway,
          'dns-server': ['8.8.8.8', '8.8.4.4'],
          start: dhcpStart,
          stop: dhcpStop,
          lease: '86400',
        },
      },
    }
  }

  const gatewayJson = {
    system: {
      'host-name': hostname,
      'time-zone': timezone,
      ntp: {
        server: {
          '0.ubnt.pool.ntp.org': {},
          '1.ubnt.pool.ntp.org': {},
        },
      },
    },
    interfaces: {
      ethernet: {
        eth0: {
          description: 'WAN',
          'hw-id': '00:00:00:00:00:00',
          address: 'dhcp',
        },
        eth1: {
          description: 'LAN',
          address: `${lanIp}/${subnetPrefix}`,
        },
      },
    },
    service: {
      'dhcp-server': {
        disabled: false,
        'shared-network-name': dhcpNetworks,
      },
      nat: {
        rule: {
          '5000': {
            description: 'MASQ-LAN-to-WAN',
            'outbound-interface': 'eth0',
            type: 'masquerade',
          },
        },
      },
      ssh: {
        port: 22,
        'protocol-version': 'v2',
      },
    },
    firewall: {
      'all-ping': 'enable',
      'broadcast-ping': 'disable',
      'ipv6-receive-redirects': 'disable',
      'ipv6-src-route': 'disable',
      'ip-src-route': 'disable',
      'log-martians': 'enable',
      'receive-redirects': 'disable',
      'send-redirects': 'enable',
      'source-validation': 'disable',
      'syn-cookies': 'enable',
    },
  }

  if (!d.ipAddress) {
    warnings.push('No IP address on device — defaulted LAN to 192.168.1.1/24.')
  }

  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: 'unifi-json',
    filename: 'config.gateway.json',
    content: JSON.stringify(gatewayJson, null, 2),
    warnings,
    instructions: GATEWAY_JSON_INSTRUCTIONS,
  }
}

// ─── config-apply.sh generator ────────────────────────────────────────────────

function generateApplyScript(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const d = device.data
  const hostname = d.hostname || 'unifi-gw'
  const vlanSet = collectVlans(topology, device)
  const warnings: string[] = []

  const ssids = d['ssids'] as Array<{ name: string; security?: string; vlanId?: number }> | undefined

  const lines: string[] = [
    '#!/usr/bin/env bash',
    '# config-apply.sh — generated by Gridhive',
    '# Applies VLANs, SSIDs, and port profiles via the UniFi REST API',
    '#',
    '# Install dependencies: curl, jq',
    '',
    '# ── CONFIGURE THESE VALUES ─────────────────────────────────────',
    'UNIFI_HOST="https://192.168.1.1"',
    'USERNAME="admin"',
    'PASSWORD="your-password"',
    'SITE="default"',
    '# ──────────────────────────────────────────────────────────────',
    '',
    'set -euo pipefail',
    '',
    '# Login and capture cookie',
    'COOKIE_JAR=$(mktemp)',
    'curl -sk -c "$COOKIE_JAR" -o /dev/null \\',
    '  -X POST "${UNIFI_HOST}/api/login" \\',
    '  -H "Content-Type: application/json" \\',
    `  -d '{"username":"'"$USERNAME"'","password":"'"$PASSWORD"'"}'`,
    '',
    `echo "Logged into UniFi controller at ${hostname}..."`,
    '',
  ]

  if (vlanSet.size > 0) {
    lines.push('# ── Create VLANs ──────────────────────────────────────────────')
    for (const [vlanId, vlanName] of vlanSet.entries()) {
      lines.push(`echo "Creating VLAN ${vlanId} (${vlanName})..."`)
      lines.push('curl -sk -b "$COOKIE_JAR" -o /dev/null \\')
      lines.push(`  -X POST "\${UNIFI_HOST}/api/s/\${SITE}/rest/networkconf" \\`)
      lines.push('  -H "Content-Type: application/json" \\')
      lines.push(`  -d '{"name":"${vlanName}","vlan":${vlanId},"purpose":"vlan-only","enabled":true}'`)
      lines.push('')
    }
  } else {
    warnings.push('No VLANs found — VLAN creation block is empty.')
  }

  if (ssids && ssids.length > 0) {
    lines.push('# ── Create WLANs (SSIDs) ──────────────────────────────────────')
    for (const ssid of ssids) {
      const security = ssid.security || 'wpapsk'
      const vlanId = ssid.vlanId || 1
      lines.push(`echo "Creating SSID: ${ssid.name}..."`)
      lines.push('curl -sk -b "$COOKIE_JAR" -o /dev/null \\')
      lines.push(`  -X POST "\${UNIFI_HOST}/api/s/\${SITE}/rest/wlanconf" \\`)
      lines.push('  -H "Content-Type: application/json" \\')
      lines.push(`  -d '{"name":"${ssid.name}","security":"${security}","vlan":${vlanId},"enabled":true}'`)
      lines.push('')
    }
  }

  lines.push('# ── Logout ────────────────────────────────────────────────────')
  lines.push('curl -sk -b "$COOKIE_JAR" -o /dev/null \\')
  lines.push('  -X POST "${UNIFI_HOST}/api/logout"')
  lines.push('rm -f "$COOKIE_JAR"')
  lines.push('')
  lines.push('echo "Done. Review UniFi Network Application to verify changes."')

  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: 'unifi-network-app',
    filename: 'config-apply.sh',
    content: lines.join('\n'),
    warnings,
    instructions: GATEWAY_JSON_INSTRUCTIONS,
  }
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Generates both the EdgeOS config.gateway.json and the REST API apply script.
 * Returns an array of two ConfigExportResult entries.
 */
export function generateUniFiGatewayConfig(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult[] {
  return [
    generateGatewayJson(topology, device, profile),
    generateApplyScript(topology, device, profile),
  ]
}

/**
 * Convenience overload that returns a single result combining both files.
 * The `content` field contains a JSON envelope with both files, and the
 * `filename` is set to `config.gateway.json` (the primary artifact).
 */
export function generateUniFiGateway(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const [gwJson, applyScript] = generateUniFiGatewayConfig(topology, device, profile)
  const combined = JSON.stringify(
    {
      files: [
        { filename: gwJson.filename, content: gwJson.content },
        { filename: applyScript.filename, content: applyScript.content },
      ],
    },
    null,
    2,
  )
  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: 'unifi-json',
    filename: 'config.gateway.json',
    content: combined,
    warnings: [...new Set([...gwJson.warnings, ...applyScript.warnings])],
    instructions: GATEWAY_JSON_INSTRUCTIONS,
  }
}
