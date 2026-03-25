/**
 * @deprecated UniFiJsonGenerator is superseded by UniFiGatewayGenerator (Phase 4 Pillar C).
 * This file is kept for backward compatibility only. All new code should import from
 * './UniFiGatewayGenerator' instead.
 *
 * UniFiGatewayGenerator produces:
 *   1. config.gateway.json — EdgeOS-compatible JSON for UDM/USG
 *   2. config-apply.sh     — REST API shell script for VLANs/SSIDs
 */

export {
  generateUniFiGateway as generateUniFiGatewayConfig,
  generateUniFiGatewayConfig as generateUniFiGatewayFiles,
} from './UniFiGatewayGenerator.js'

import type { TopologySnapshot, DeviceNode, VendorDeviceProfile, ConfigExportResult } from '@gridhive/shared'

const INSTRUCTIONS = 'Import via UniFi Network Application > Settings > System > Backup and Restore > Restore.'

/** @deprecated Use generateUniFiGateway from UniFiGatewayGenerator instead. */
export function generateUniFiJson(
  topology: TopologySnapshot,
  device: DeviceNode,
  profile: VendorDeviceProfile,
): ConfigExportResult {
  const d = device.data
  const hostname = d.hostname || 'unifi-device'
  const timezone = (d['timezone'] as string | undefined) || 'UTC'
  const warnings: string[] = []

  // Collect VLANs from the device itself and adjacent nodes
  const vlanSet = new Map<number, string>()
  if (d.vlanId) {
    vlanSet.set(d.vlanId, `vlan${d.vlanId}`)
  }
  if (Array.isArray(d.vlanTrunkPorts)) {
    for (const v of d.vlanTrunkPorts) {
      if (!vlanSet.has(v)) vlanSet.set(v, `vlan${v}`)
    }
  }

  // Look at adjacent nodes for VLAN context
  const connectedNodeIds = topology.edges
    .filter(e => e.source === device.id || e.target === device.id)
    .map(e => (e.source === device.id ? e.target : e.source))
  for (const nid of connectedNodeIds) {
    const neighbor = topology.nodes.find(n => n.id === nid)
    if (neighbor?.data.vlanId && !vlanSet.has(neighbor.data.vlanId)) {
      vlanSet.set(neighbor.data.vlanId, `vlan${neighbor.data.vlanId}`)
    }
  }

  // Build data array
  const data: unknown[] = []

  // System config entry
  const sysCfgParts: string[] = [
    `hostname=${hostname}`,
    `config.system.timezone=${timezone}`,
  ]
  if (d.ipAddress) {
    sysCfgParts.push(`config.system.ip=${d.ipAddress}`)
  }
  data.push({ key: 'system.cfg', value: sysCfgParts.join('\\n') })

  // Network / VLAN entries
  for (const [vlanId, vlanName] of vlanSet.entries()) {
    const entry: Record<string, unknown> = {
      key: `network/${vlanName}`,
      name: vlanName,
      vlan: vlanId,
    }
    // Try to find subnet from device data if vlanId matches
    if (vlanId === d.vlanId && d.ipAddress && d.subnet) {
      entry['ip_subnet'] = `${d.ipAddress}/${d.subnet}`
    }
    data.push(entry)
  }

  // WAN settings
  const wanIp = (d['wanIp'] as string | undefined) || (d['wan_ip'] as string | undefined)
  const wanGateway = (d['wanGateway'] as string | undefined) || d.defaultGateway
  if (wanIp || wanGateway) {
    const wanEntry: Record<string, unknown> = { key: 'network/wan' }
    if (wanIp) wanEntry['ip'] = wanIp
    if (wanGateway) wanEntry['gateway'] = wanGateway
    data.push(wanEntry)
  }

  // Wireless SSIDs (for UDM/USG/AP devices)
  const ssids = d['ssids'] as Array<{ name: string; security?: string }> | undefined
  if (ssids && Array.isArray(ssids)) {
    for (const ssid of ssids) {
      data.push({
        key: `wlan/${ssid.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: ssid.name,
        security: ssid.security || 'wpa2',
      })
    }
  }

  if (vlanSet.size === 0) {
    warnings.push('No VLAN information found on device or connected nodes.')
  }

  const content = JSON.stringify({ meta: { rc: 'ok' }, data }, null, 2)

  return {
    deviceId: device.id,
    vendor: profile.vendor,
    format: profile.configFormat,
    filename: `${hostname}-unifi-backup.json`,
    content,
    warnings,
    instructions: INSTRUCTIONS,
  }
}
