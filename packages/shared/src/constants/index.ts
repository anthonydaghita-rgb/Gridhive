export const DEVICE_CATEGORIES = {
  'Network Infrastructure': ['firewall', 'switch-l2', 'switch-l3', 'router', 'wireless-ap', 'patch-panel'],
  'End Devices': ['workstation', 'server', 'printer', 'voip-phone', 'nas'],
  'Security & Monitoring': ['camera', 'firewall-edge'],
  'Industrial': ['plc', 'sensor', 'hmi'],
  'Other': ['internet'],
} as const

export const DEFAULT_VLANS = {
  DATA: 10,
  VOICE: 20,
  GUEST: 30,
  SERVERS: 40,
  DMZ: 50,
  MGMT: 99,
} as const

export const DEVICE_DISPLAY_NAMES: Record<string, string> = {
  'firewall': 'Firewall',
  'switch-l2': 'L2 Switch',
  'switch-l3': 'L3 Switch',
  'router': 'Router',
  'server': 'Server',
  'workstation': 'Workstation',
  'printer': 'Printer',
  'wireless-ap': 'Wireless AP',
  'camera': 'Camera',
  'voip-phone': 'VoIP Phone',
  'nas': 'NAS',
  'internet': 'Internet',
  'plc': 'PLC',
  'sensor': 'Sensor',
  'patch-panel': 'Patch Panel',
  'hmi': 'HMI',
  'firewall-edge': 'Edge Firewall',
}
