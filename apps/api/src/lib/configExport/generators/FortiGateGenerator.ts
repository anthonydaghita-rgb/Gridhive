import type { TopologySnapshot, DeviceNode, VendorDeviceProfile, ConfigExportResult } from '@gridhive/shared'

const INSTRUCTIONS =
  "Paste into FortiGate SSH session or CLI console. Run 'execute cfg save' after pasting to persist the configuration."

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
  const ipInt =
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  const net = (ipInt & mask) >>> 0
  return [
    (net >>> 24) & 0xff,
    (net >>> 16) & 0xff,
    (net >>> 8) & 0xff,
    net & 0xff,
  ].join('.')
}

interface VlanInfo {
  id: number
  name: string
}

function collectVlans(topology: TopologySnapshot, device: DeviceNode): VlanInfo[] {
  const vlanMap = new Map<number, VlanInfo>()

  const addVlan = (id: number, name?: string) => {
    if (!vlanMap.has(id)) vlanMap.set(id, { id, name: name || `VLAN${id}` })
  }

  if (device.data.vlanId) addVlan(device.data.vlanId)
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

// ─── section builders ─────────────────────────────────────────────────────────

function buildSystemGlobal(hostname: string): string {
  return [
    'config system global',
    `    set hostname "${hostname}"`,
    '    set timezone 04',
    '    set admintimeout 30',
    'end',
  ].join('\n')
}

function buildInterfaces(device: DeviceNode, vlans: VlanInfo[]): string {
  const d = device.data
  const lanIp = d.ipAddress || '192.168.1.1'
  const prefix = d.subnet ? parseInt(d.subnet, 10) : 24
  const lanMask = subnetPrefixToMask(prefix)

  const lines: string[] = [
    'config system interface',
    '    edit "port1"',
    '        set alias "WAN"',
    '        set ip 0.0.0.0 0.0.0.0',
    '        set allowaccess ping https ssh',
    '        set role wan',
    '    next',
    '    edit "port2"',
    `        set alias "LAN"`,
    `        set ip ${lanIp} ${lanMask}`,
    '        set allowaccess ping https ssh',
    '        set role lan',
    '    next',
  ]

  // Add VLAN sub-interfaces on port2
  let vlanIndex = 3
  for (const vlan of vlans) {
    if (vlan.id === d.vlanId) continue // already covered by port2
    const octet = 10 + (vlanIndex - 3)
    lines.push(`    edit "port2.${vlan.id}"`)
    lines.push(`        set alias "${vlan.name}"`)
    lines.push(`        set ip 10.${octet}.0.1 255.255.255.0`)
    lines.push(`        set interface "port2"`)
    lines.push(`        set vlanid ${vlan.id}`)
    lines.push('        set allowaccess ping')
    lines.push('        set role lan')
    lines.push('    next')
    vlanIndex++
  }

  lines.push('end')
  return lines.join('\n')
}

function buildDhcpServer(device: DeviceNode, vlans: VlanInfo[]): string {
  const d = device.data
  const lanIp = d.ipAddress || '192.168.1.1'
  const prefix = d.subnet ? parseInt(d.subnet, 10) : 24
  const lanMask = subnetPrefixToMask(prefix)
  const lanNetwork = deriveNetworkAddress(lanIp, prefix)
  const parts = lanIp.split('.').map(Number)
  const dhcpStart = `${parts[0]}.${parts[1]}.${parts[2]}.10`
  const dhcpEnd = `${parts[0]}.${parts[1]}.${parts[2]}.254`

  const lines: string[] = ['config system dhcp server']

  // Primary LAN DHCP
  lines.push('    edit 1')
  lines.push('        set interface "port2"')
  lines.push(`        set gateway-ip ${lanIp}`)
  lines.push('        set dns-server1 8.8.8.8')
  lines.push('        set dns-server2 8.8.4.4')
  lines.push(`        set default-gateway ${lanIp}`)
  lines.push('        config ip-range')
  lines.push('            edit 1')
  lines.push(`                set start-ip ${dhcpStart}`)
  lines.push(`                set end-ip ${dhcpEnd}`)
  lines.push('            next')
  lines.push('        end')
  lines.push(`        set netmask ${lanMask}`)
  lines.push(`        set domain "${lanNetwork}"`)
  lines.push('    next')
  void lanNetwork

  // Per-VLAN DHCP entries
  let editId = 2
  for (const vlan of vlans) {
    if (vlan.id === d.vlanId) continue
    const octet = 10 + editId - 2
    lines.push(`    edit ${editId}`)
    lines.push(`        set interface "port2.${vlan.id}"`)
    lines.push(`        set gateway-ip 10.${octet}.0.1`)
    lines.push('        set dns-server1 8.8.8.8')
    lines.push(`        set default-gateway 10.${octet}.0.1`)
    lines.push('        config ip-range')
    lines.push('            edit 1')
    lines.push(`                set start-ip 10.${octet}.0.10`)
    lines.push(`                set end-ip 10.${octet}.0.254`)
    lines.push('            next')
    lines.push('        end')
    lines.push('        set netmask 255.255.255.0')
    lines.push('    next')
    editId++
  }

  lines.push('end')
  return lines.join('\n')
}

function buildFirewallPolicy(): string {
  return [
    'config firewall policy',
    '    edit 1',
    '        set name "LAN-to-WAN"',
    '        set srcintf "port2"',
    '        set dstintf "port1"',
    '        set srcaddr "all"',
    '        set dstaddr "all"',
    '        set action accept',
    '        set schedule "always"',
    '        set service "ALL"',
    '        set logtraffic all',
    '        set nat enable',
    '    next',
    '    edit 2',
    '        set name "WAN-to-LAN-deny"',
    '        set srcintf "port1"',
    '        set dstintf "port2"',
    '        set srcaddr "all"',
    '        set dstaddr "all"',
    '        set action deny',
    '        set schedule "always"',
    '        set service "ALL"',
    '        set logtraffic all',
    '    next',
    'end',
  ].join('\n')
}

// ─── public API ───────────────────────────────────────────────────────────────

export function generateFortiGate(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const d = device.data
  const hostname = d.hostname || 'FortiGate'
  const warnings: string[] = []
  const vlans = collectVlans(topology, device)

  if (!d.ipAddress) {
    warnings.push('No IP address on device — defaulted LAN interface to 192.168.1.1/24.')
  }
  if (vlans.length === 0) {
    warnings.push('No VLAN information found — only primary LAN interface generated.')
  }

  const sections = [
    `! FortiGate CLI Configuration — generated by Gridhive`,
    `! Hostname: ${hostname}`,
    `! Generated: ${new Date().toISOString()}`,
    '!',
    buildSystemGlobal(hostname),
    '',
    buildInterfaces(device, vlans),
    '',
    buildDhcpServer(device, vlans),
    '',
    buildFirewallPolicy(),
  ]

  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: 'fortios-cli',
    filename: `${hostname}.cli.txt`,
    content: sections.join('\n'),
    warnings,
    instructions: INSTRUCTIONS,
  }
}
