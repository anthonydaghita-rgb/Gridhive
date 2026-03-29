import type { DeviceType } from '@gridhive/shared'

// Categories group device types for rule matching
const NETWORK_INFRASTRUCTURE = new Set<DeviceType>([
  'firewall', 'firewall-edge', 'switch-l2', 'switch-l3', 'router',
  'load-balancer', 'wan-optimizer', 'content-filter', 'ddos-scrubber',
  'dns-server', 'radius-server', 'proxy-server', 'siem-server', 'log-server',
  'network-tap', 'packet-broker', 'wireless-controller', 'cellular-gateway',
  'cellular-modem', 'satellite-modem', 'lte-router', 'sd-wan-appliance',
  'patch-panel', 'internet', 'isp-handoff',
])

const END_USER_DEVICES = new Set<DeviceType>([
  'workstation', 'thin-client', 'voip-phone', 'printer',
])

const WIRELESS_ACCESS_POINTS = new Set<DeviceType>(['wireless-ap'])

const STORAGE_DEVICES = new Set<DeviceType>([
  'nas', 'san-switch', 'tape-library', 'backup-appliance', 'object-storage',
])

const SERVERS = new Set<DeviceType>([
  'server', 'blade-server', 'gpu-server', 'hypervisor', 'virtual-machine',
  'container-host', 'blade-chassis', 'server-rack',
  'dns-server', 'radius-server', 'proxy-server', 'siem-server', 'log-server',
  'ac-server', 'pbx-server', 'sbc', 'voip-gateway',
  'historian-server', 'scada-server', 'emr-server', 'pacs-server', 'nurse-call-server',
  'video-analytics-server',
])

const OT_FIELD_DEVICES = new Set<DeviceType>([
  'plc', 'sensor', 'rtu', 'ied', 'dcs', 'sis-controller',
  'hmi', 'protocol-converter', 'data-diode',
])

const POWER_DEVICES = new Set<DeviceType>([
  'ups', 'pdu', 'generator', 'cooling-unit', 'environmental-sensor',
])

const PHYSICAL_SECURITY = new Set<DeviceType>([
  'camera', 'nvr', 'dvr', 'license-plate-reader',
  'intrusion-panel', 'fire-panel-gateway', 'video-analytics-server',
  'video-conference-unit',
])

const ACCESS_CONTROL = new Set<DeviceType>([
  'ac-server', 'ac-controller', 'ac-reader', 'ac-door-hardware',
  'ac-intercom', 'ac-biometric', 'ac-key-pad', 'ac-visitor-kiosk',
  'ac-elevator-ctrl', 'ac-turnstile',
])

const SMART_BUILDING = new Set<DeviceType>([
  'bas-controller', 'hvac-controller', 'lighting-controller',
  'energy-meter', 'bacnet-router', 'elevator-controller',
])

const HEALTHCARE = new Set<DeviceType>([
  'medical-device', 'infusion-pump', 'patient-monitor',
  'emr-server', 'pacs-server', 'nurse-call-server',
])

const CLOUD = new Set<DeviceType>([
  'cloud-aws', 'cloud-azure', 'cloud-gcp', 'cloud-m365',
  'cloud-saas', 'colocation-fabric',
])

// Returns the human-friendly category name for a device type
function getCategoryLabel(dt: DeviceType): string {
  if (NETWORK_INFRASTRUCTURE.has(dt)) return 'Network Infrastructure'
  if (END_USER_DEVICES.has(dt)) return 'End-User Device'
  if (WIRELESS_ACCESS_POINTS.has(dt)) return 'Wireless Access Point'
  if (STORAGE_DEVICES.has(dt)) return 'Storage Device'
  if (SERVERS.has(dt)) return 'Server'
  if (OT_FIELD_DEVICES.has(dt)) return 'OT Field Device'
  if (POWER_DEVICES.has(dt)) return 'Power/Environmental'
  if (PHYSICAL_SECURITY.has(dt)) return 'Physical Security'
  if (ACCESS_CONTROL.has(dt)) return 'Access Control'
  if (SMART_BUILDING.has(dt)) return 'Smart Building'
  if (HEALTHCARE.has(dt)) return 'Healthcare'
  if (CLOUD.has(dt)) return 'Cloud Service'
  return 'Device'
}

interface ValidationResult {
  valid: boolean
  reason?: string
}

// Specific hard-block rules (pairs are unordered — order doesn't matter)
interface BlockRule {
  a: Set<DeviceType> | DeviceType[]
  b: Set<DeviceType> | DeviceType[]
  reason: string
}

const BLOCK_RULES: BlockRule[] = [
  // Wireless AP cannot connect directly to end-user devices
  {
    a: WIRELESS_ACCESS_POINTS,
    b: END_USER_DEVICES,
    reason: 'Wireless APs connect to switches or a wireless controller, not directly to end-user devices. End-user devices associate wirelessly — they don\'t need a physical cable to the AP.',
  },
  // Power/environmental devices don't get network cables to end-user devices
  {
    a: POWER_DEVICES,
    b: END_USER_DEVICES,
    reason: 'Power and environmental devices (UPS, PDU, etc.) connect to network management infrastructure, not directly to end-user devices.',
  },
  // Power-only devices can't connect to cloud services
  {
    a: POWER_DEVICES,
    b: CLOUD,
    reason: 'Power and environmental devices do not connect directly to cloud services. They connect to local management or monitoring systems first.',
  },
  // Cloud services don't connect directly to OT field devices
  {
    a: CLOUD,
    b: OT_FIELD_DEVICES,
    reason: 'OT field devices (PLCs, RTUs, sensors) should not connect directly to cloud services. Use a SCADA server, historian, or DMZ as an intermediary for security.',
  },
  // Storage devices don't connect to access control readers/hardware
  {
    a: STORAGE_DEVICES,
    b: new Set<DeviceType>(['ac-reader', 'ac-door-hardware', 'ac-turnstile', 'ac-biometric', 'ac-key-pad']),
    reason: 'Access control edge devices (readers, door hardware) connect to an AC controller, not directly to storage systems.',
  },
  // Internet node doesn't connect directly to servers (missing firewall)
  {
    a: new Set<DeviceType>(['internet']),
    b: SERVERS,
    reason: 'Servers should not connect directly to the Internet. Place a firewall between them to filter inbound and outbound traffic.',
  },
  // Internet doesn't connect directly to end-user devices
  {
    a: new Set<DeviceType>(['internet']),
    b: END_USER_DEVICES,
    reason: 'End-user devices should not connect directly to the Internet node. Route traffic through a firewall and switch first.',
  },
  // Internet doesn't connect directly to OT devices
  {
    a: new Set<DeviceType>(['internet']),
    b: OT_FIELD_DEVICES,
    reason: 'OT/ICS field devices must never be directly Internet-connected. Use a firewall and DMZ architecture.',
  },
  // Wireless AP to wireless AP — typically no direct cable (mesh uses backhaul, not direct connections)
  {
    a: WIRELESS_ACCESS_POINTS,
    b: WIRELESS_ACCESS_POINTS,
    reason: 'Wired connections between two Access Points are unusual. If you need wireless mesh/backhaul, configure it in the AP settings. Otherwise, both APs should uplink to a switch.',
  },
]

function matchesSet(dt: DeviceType, setOrArr: Set<DeviceType> | DeviceType[]): boolean {
  if (Array.isArray(setOrArr)) return setOrArr.includes(dt)
  return (setOrArr as Set<DeviceType>).has(dt)
}

export function validateConnection(sourceType: DeviceType, targetType: DeviceType): ValidationResult {
  for (const rule of BLOCK_RULES) {
    const aToB = matchesSet(sourceType, rule.a) && matchesSet(targetType, rule.b)
    const bToA = matchesSet(targetType, rule.a) && matchesSet(sourceType, rule.b)
    if (aToB || bToA) {
      return { valid: false, reason: rule.reason }
    }
  }

  return { valid: true }
}
