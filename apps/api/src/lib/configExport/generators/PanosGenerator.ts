import type { TopologySnapshot, DeviceNode, VendorDeviceProfile, ConfigExportResult } from '@gridhive/shared'

const INSTRUCTIONS =
  "Paste into PAN-OS CLI in configure mode (type 'configure' first). Run 'commit' when done to activate the configuration."

// ─── helpers ──────────────────────────────────────────────────────────────────

function subnetPrefixToMask(prefix: number): string {
  const mask = (0xffffffff << (32 - prefix)) >>> 0
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff,
  ].join('.')
}

function deriveNetworkAddress(ip: string, prefix: number): string {
  const parts = ip.split('.').map(Number)
  const mask = (0xffffffff << (32 - prefix)) >>> 0
  const ipInt = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  const net = (ipInt & mask) >>> 0
  const netParts = [
    (net >>> 24) & 0xff,
    (net >>> 16) & 0xff,
    (net >>> 8) & 0xff,
    net & 0xff,
  ]
  return netParts.join('.')
}

interface VlanInfo {
  id: number
  name: string
  ip: string
  prefix: number
  zone: string
}

function collectVlans(topology: TopologySnapshot, device: DeviceNode): VlanInfo[] {
  const vlanMap = new Map<number, VlanInfo>()

  const addVlan = (id: number, name?: string) => {
    if (vlanMap.has(id)) return
    const thirdOctet = id < 255 ? id : (id % 255)
    vlanMap.set(id, {
      id,
      name: name || `VLAN${id}`,
      ip: `10.${thirdOctet}.0.1`,
      prefix: 24,
      zone: name ? name.toLowerCase().replace(/\s+/g, '-') : `vlan${id}`,
    })
  }

  if (device.data.vlanId) {
    const ip = device.data.ipAddress || '192.168.1.1'
    const prefix = device.data.subnet ? parseInt(device.data.subnet, 10) : 24
    vlanMap.set(device.data.vlanId, {
      id: device.data.vlanId,
      name: `VLAN${device.data.vlanId}`,
      ip,
      prefix,
      zone: 'trust',
    })
  }

  if (Array.isArray(device.data.vlanTrunkPorts)) {
    for (const v of device.data.vlanTrunkPorts) addVlan(v)
  }

  if (device.data.portMappings) {
    for (const pm of device.data.portMappings) {
      if (pm.vlanId) addVlan(pm.vlanId)
      if (Array.isArray(pm.trunkVlans)) {
        for (const v of pm.trunkVlans) addVlan(v)
      }
    }
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
    if (neighbor?.data.vlanId) addVlan(neighbor.data.vlanId, neighbor.data.label)
  }

  return Array.from(vlanMap.values()).sort((a, b) => a.id - b.id)
}

// ─── set-command builders ─────────────────────────────────────────────────────

function buildDeviceConfig(hostname: string): string[] {
  return [
    `set deviceconfig system hostname ${hostname}`,
    'set deviceconfig system dns-setting servers primary 8.8.8.8',
    'set deviceconfig system dns-setting servers secondary 8.8.4.4',
    'set deviceconfig system ntp-servers primary-ntp-server ntp-server-address pool.ntp.org',
    'set deviceconfig system ntp-servers secondary-ntp-server ntp-server-address time.cloudflare.com',
  ]
}

function buildInterfaces(device: DeviceNode, vlans: VlanInfo[]): string[] {
  const d = device.data
  const lanIp = d.ipAddress || '192.168.1.1'
  const prefix = d.subnet ? parseInt(d.subnet, 10) : 24

  const lines: string[] = [
    '# ── Interfaces ──────────────────────────────────────────────────',
    'set network interface ethernet ethernet1/1 layer3 ip 0.0.0.0/0',
    'set network interface ethernet ethernet1/1 comment "WAN"',
    `set network interface ethernet ethernet1/2 layer3 ip ${lanIp}/${prefix}`,
    'set network interface ethernet ethernet1/2 comment "LAN"',
  ]

  // Sub-interfaces for additional VLANs
  let subIfIndex = 1
  for (const vlan of vlans) {
    if (vlan.id === d.vlanId) continue
    lines.push(
      `set network interface ethernet ethernet1/2.${vlan.id} layer3 ip ${vlan.ip}/${vlan.prefix}`,
    )
    lines.push(`set network interface ethernet ethernet1/2.${vlan.id} tag ${vlan.id}`)
    lines.push(`set network interface ethernet ethernet1/2.${vlan.id} comment "${vlan.name}"`)
    subIfIndex++
  }

  void subIfIndex
  return lines
}

function buildZones(vlans: VlanInfo[]): string[] {
  const lines: string[] = [
    '# ── Security Zones ──────────────────────────────────────────────',
    'set zone untrust network layer3 ethernet1/1',
    'set zone trust network layer3 ethernet1/2',
  ]

  for (const vlan of vlans) {
    if (vlan.zone === 'trust') continue
    lines.push(`set zone ${vlan.zone} network layer3 ethernet1/2.${vlan.id}`)
  }

  return lines
}

function buildAddressObjects(device: DeviceNode, vlans: VlanInfo[]): string[] {
  const d = device.data
  const lanIp = d.ipAddress || '192.168.1.1'
  const prefix = d.subnet ? parseInt(d.subnet, 10) : 24
  const lanNet = deriveNetworkAddress(lanIp, prefix)
  const lanMask = subnetPrefixToMask(prefix)

  const lines: string[] = [
    '# ── Address Objects ─────────────────────────────────────────────',
    `set address LAN-Net ip-netmask ${lanNet}/${prefix}`,
    `set address LAN-Net description "LAN Network ${lanIp} ${lanMask}"`,
  ]

  for (const vlan of vlans) {
    if (vlan.id === d.vlanId) continue
    const net = deriveNetworkAddress(vlan.ip, vlan.prefix)
    lines.push(`set address ${vlan.name}-Net ip-netmask ${net}/${vlan.prefix}`)
    lines.push(`set address ${vlan.name}-Net description "${vlan.name} Network"`)
  }

  return lines
}

function buildSecurityPolicy(vlans: VlanInfo[]): string[] {
  const lines: string[] = [
    '# ── Security Policy ─────────────────────────────────────────────',
    'set rulebase security rules Allow-Outbound from trust',
    'set rulebase security rules Allow-Outbound to untrust',
    'set rulebase security rules Allow-Outbound source any',
    'set rulebase security rules Allow-Outbound destination any',
    'set rulebase security rules Allow-Outbound application any',
    'set rulebase security rules Allow-Outbound service application-default',
    'set rulebase security rules Allow-Outbound action allow',
    'set rulebase security rules Allow-Outbound log-end yes',
    'set rulebase security rules Allow-Outbound description "Allow outbound internet access"',
  ]

  // Inter-VLAN rules for each non-trust zone
  const extraZones = vlans.filter(v => v.zone !== 'trust')
  for (const vlan of extraZones) {
    const ruleName = `Allow-${vlan.name}-Outbound`
    lines.push(`set rulebase security rules ${ruleName} from ${vlan.zone}`)
    lines.push(`set rulebase security rules ${ruleName} to untrust`)
    lines.push(`set rulebase security rules ${ruleName} source any`)
    lines.push(`set rulebase security rules ${ruleName} destination any`)
    lines.push(`set rulebase security rules ${ruleName} application any`)
    lines.push(`set rulebase security rules ${ruleName} service application-default`)
    lines.push(`set rulebase security rules ${ruleName} action allow`)
    lines.push(`set rulebase security rules ${ruleName} log-end yes`)
  }

  // Deny all
  lines.push('set rulebase security rules Deny-All from any')
  lines.push('set rulebase security rules Deny-All to any')
  lines.push('set rulebase security rules Deny-All source any')
  lines.push('set rulebase security rules Deny-All destination any')
  lines.push('set rulebase security rules Deny-All application any')
  lines.push('set rulebase security rules Deny-All service any')
  lines.push('set rulebase security rules Deny-All action deny')
  lines.push('set rulebase security rules Deny-All log-end yes')

  return lines
}

function buildNat(device: DeviceNode): string[] {
  const d = device.data
  const lanIp = d.ipAddress || '192.168.1.1'
  const prefix = d.subnet ? parseInt(d.subnet, 10) : 24
  const lanNet = deriveNetworkAddress(lanIp, prefix)

  return [
    '# ── NAT Policy ───────────────────────────────────────────────────',
    'set rulebase nat rules LAN-Masquerade sourcezone trust',
    'set rulebase nat rules LAN-Masquerade destinationzone untrust',
    `set rulebase nat rules LAN-Masquerade source ${lanNet}/${prefix}`,
    'set rulebase nat rules LAN-Masquerade destination any',
    'set rulebase nat rules LAN-Masquerade to ethernet1/1',
    'set rulebase nat rules LAN-Masquerade source-translation dynamic-ip-and-port interface-address',
  ]
}

// ─── public API ───────────────────────────────────────────────────────────────

export function generatePanos(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const d = device.data
  const hostname = d.hostname || 'PA-FIREWALL'
  const warnings: string[] = []
  const vlans = collectVlans(topology, device)

  if (!d.ipAddress) {
    warnings.push('No IP address on device — defaulted LAN to 192.168.1.1/24.')
  }
  if (vlans.length === 0) {
    warnings.push('No VLAN information found — only primary LAN interface generated.')
  }

  const allLines = [
    `# PAN-OS SET Command Script — generated by Gridhive`,
    `# Device: ${hostname}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Paste in configure mode. Run 'commit' when done.`,
    '#',
    ...buildDeviceConfig(hostname),
    '',
    ...buildInterfaces(device, vlans),
    '',
    ...buildZones(vlans),
    '',
    ...buildAddressObjects(device, vlans),
    '',
    ...buildSecurityPolicy(vlans),
    '',
    ...buildNat(device),
  ]

  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: 'panos-xml',
    filename: `${hostname}.set.txt`,
    content: allLines.join('\n'),
    warnings,
    instructions: INSTRUCTIONS,
  }
}
