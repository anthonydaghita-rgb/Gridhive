import type { DeviceData, DeviceType } from '@gridhive/shared'

export function getDeviceDefaults(deviceType: DeviceType): Partial<DeviceData> {
  const base: Partial<DeviceData> = {
    deviceType,
    hostname: getDefaultHostname(deviceType),
    label: getDefaultLabel(deviceType),
  }

  switch (deviceType) {
    case 'firewall':
      return { ...base, role: 'gateway', manufacturer: 'Cisco' }
    case 'firewall-edge':
      return { ...base, role: 'edge-gateway' }
    case 'switch-l2':
      return { ...base, manufacturer: 'Cisco', model: 'Catalyst 2960' }
    case 'switch-l3':
      return { ...base, interVlanRouting: false, manufacturer: 'Cisco', model: 'Catalyst 3850' }
    case 'router':
      return { ...base, manufacturer: 'Cisco', model: 'ISR 4321' }
    case 'server':
      return { ...base, os: 'Windows Server 2022', role: 'file-server' }
    case 'workstation':
      return { ...base, os: 'Windows 11' }
    case 'wireless-ap':
      return { ...base, manufacturer: 'Cisco', model: 'Aironet 3800' }
    case 'camera':
      return { ...base, manufacturer: 'Axis', role: 'security-camera' }
    case 'voip-phone':
      return { ...base, manufacturer: 'Cisco', model: 'IP Phone 8841' }
    case 'printer':
      return { ...base, manufacturer: 'HP' }
    case 'nas':
      return { ...base, manufacturer: 'Synology', os: 'DSM 7' }
    case 'internet':
      return { ...base, hostname: 'internet', label: 'Internet', role: 'wan' }
    case 'plc':
      return { ...base, manufacturer: 'Siemens', role: 'automation-controller' }
    case 'sensor':
      return { ...base, role: 'iot-sensor' }
    case 'hmi':
      return { ...base, manufacturer: 'Siemens', role: 'human-machine-interface' }
    case 'patch-panel':
      return { ...base, role: 'patch-panel' }
    case 'ac-server':
      return { ...base, manufacturer: 'Genetec', role: 'access-control-server' }
    case 'ac-controller':
      return { ...base, manufacturer: 'HID Global', role: 'door-controller' }
    case 'ac-reader':
      return { ...base, manufacturer: 'HID Global', role: 'card-reader' }
    case 'ac-door-hardware':
      return { ...base, role: 'door-hardware' }
    case 'ac-intercom':
      return { ...base, manufacturer: 'Axis', role: 'video-intercom' }
    case 'ac-biometric':
      return { ...base, role: 'biometric-reader' }
    case 'ac-key-pad':
      return { ...base, role: 'keypad-reader' }
    case 'ac-visitor-kiosk':
      return { ...base, role: 'visitor-management' }
    case 'ac-elevator-ctrl':
      return { ...base, role: 'elevator-controller' }
    case 'ac-turnstile':
      return { ...base, role: 'turnstile' }
    default:
      return base
  }
}

function getDefaultHostname(deviceType: DeviceType): string {
  const timestamp = Date.now().toString().slice(-4)
  const prefixes: Partial<Record<DeviceType, string>> = {
    'firewall': 'FW',
    'firewall-edge': 'FW-EDGE',
    'switch-l2': 'SW-L2',
    'switch-l3': 'SW-L3',
    'router': 'RTR',
    'server': 'SRV',
    'workstation': 'WS',
    'wireless-ap': 'AP',
    'camera': 'CAM',
    'voip-phone': 'VOIP',
    'printer': 'PRT',
    'nas': 'NAS',
    'internet': 'INTERNET',
    'plc': 'PLC',
    'sensor': 'SENSOR',
    'hmi': 'HMI',
    'patch-panel': 'PP',
    'ac-server': 'ACS',
    'ac-controller': 'ACC',
    'ac-reader': 'ACR',
    'ac-door-hardware': 'DOOR',
    'ac-intercom': 'ICOM',
    'ac-biometric': 'BIO',
    'ac-key-pad': 'KP',
    'ac-visitor-kiosk': 'KIOSK',
    'ac-elevator-ctrl': 'ELEV',
    'ac-turnstile': 'TURN',
  }
  return `${prefixes[deviceType] || 'DEV'}-${timestamp}`
}

function getDefaultLabel(deviceType: DeviceType): string {
  const labels: Partial<Record<DeviceType, string>> = {
    'firewall': 'Firewall',
    'firewall-edge': 'Edge Firewall',
    'switch-l2': 'L2 Switch',
    'switch-l3': 'L3 Switch',
    'router': 'Router',
    'server': 'Server',
    'workstation': 'Workstation',
    'wireless-ap': 'Wireless AP',
    'camera': 'Camera',
    'voip-phone': 'VoIP Phone',
    'printer': 'Printer',
    'nas': 'NAS',
    'internet': 'Internet',
    'plc': 'PLC',
    'sensor': 'Sensor',
    'hmi': 'HMI',
    'patch-panel': 'Patch Panel',
    'ac-server': 'AC Server',
    'ac-controller': 'AC Controller',
    'ac-reader': 'Card Reader',
    'ac-door-hardware': 'Door Hardware',
    'ac-intercom': 'Intercom',
    'ac-biometric': 'Biometric Reader',
    'ac-key-pad': 'Keypad',
    'ac-visitor-kiosk': 'Visitor Kiosk',
    'ac-elevator-ctrl': 'Elevator Controller',
    'ac-turnstile': 'Turnstile',
  }
  return labels[deviceType] || 'Device'
}
