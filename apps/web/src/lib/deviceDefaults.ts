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
    // Network Infrastructure (Phase 4)
    'load-balancer': 'LB',
    'wan-optimizer': 'WANO',
    'content-filter': 'CF',
    'ddos-scrubber': 'DDOS',
    'dns-server': 'DNS',
    'radius-server': 'RADIUS',
    'proxy-server': 'PROXY',
    'siem-server': 'SIEM',
    'log-server': 'LOG',
    'network-tap': 'TAP',
    'packet-broker': 'PB',
    // Wireless and Cellular (Phase 4)
    'wireless-controller': 'WLC',
    'cellular-gateway': 'CELL-GW',
    'cellular-modem': 'CELL',
    'satellite-modem': 'SAT',
    'lte-router': 'LTE',
    'sd-wan-appliance': 'SDWAN',
    // Compute and Virtualization (Phase 4)
    'hypervisor': 'HV',
    'virtual-machine': 'VM',
    'container-host': 'CTR',
    'blade-chassis': 'CHASSIS',
    'blade-server': 'BLADE',
    'server-rack': 'RACK',
    'thin-client': 'TC',
    'gpu-server': 'GPU',
    // Storage (Phase 4)
    'san-switch': 'SAN',
    'tape-library': 'TAPE',
    'backup-appliance': 'BKP',
    'object-storage': 'OBJ',
    // Power and Environmental (Phase 4)
    'ups': 'UPS',
    'pdu': 'PDU',
    'environmental-sensor': 'ENV',
    'generator': 'GEN',
    'cooling-unit': 'COOL',
    // Unified Communications (Phase 4)
    'pbx-server': 'PBX',
    'sbc': 'SBC',
    'voip-gateway': 'VOIP-GW',
    'video-conference-unit': 'VC',
    // Industrial OT (Phase 4)
    'rtu': 'RTU',
    'dcs': 'DCS',
    'sis-controller': 'SIS',
    'historian-server': 'HIST',
    'scada-server': 'SCADA',
    'ied': 'IED',
    'protocol-converter': 'PC',
    'data-diode': 'DD',
    // Physical Security (Phase 4)
    'nvr': 'NVR',
    'dvr': 'DVR',
    'video-analytics-server': 'VAS',
    'license-plate-reader': 'LPR',
    'intrusion-panel': 'IDS',
    'fire-panel-gateway': 'FIRE',
    // Smart Building (Phase 4)
    'bas-controller': 'BAS',
    'hvac-controller': 'HVAC',
    'lighting-controller': 'LIGHT',
    'energy-meter': 'EMTR',
    'bacnet-router': 'BACNET',
    'elevator-controller': 'ELEV',
    // Healthcare (Phase 4)
    'medical-device': 'MED',
    'infusion-pump': 'PUMP',
    'patient-monitor': 'PMON',
    'emr-server': 'EMR',
    'pacs-server': 'PACS',
    'nurse-call-server': 'NRSE',
    // Cloud and Internet (Phase 4)
    'cloud-aws': 'AWS',
    'cloud-azure': 'AZURE',
    'cloud-gcp': 'GCP',
    'cloud-m365': 'M365',
    'cloud-saas': 'SAAS',
    'colocation-fabric': 'COLO',
    'isp-handoff': 'ISP',
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
    // Network Infrastructure (Phase 4)
    'load-balancer': 'Load Balancer',
    'wan-optimizer': 'WAN Optimizer',
    'content-filter': 'Content Filter',
    'ddos-scrubber': 'DDoS Scrubber',
    'dns-server': 'DNS Server',
    'radius-server': 'RADIUS Server',
    'proxy-server': 'Proxy Server',
    'siem-server': 'SIEM Server',
    'log-server': 'Log Server',
    'network-tap': 'Network TAP',
    'packet-broker': 'Packet Broker',
    // Wireless and Cellular (Phase 4)
    'wireless-controller': 'Wireless Controller',
    'cellular-gateway': 'Cellular Gateway',
    'cellular-modem': 'Cellular Modem',
    'satellite-modem': 'Satellite Modem',
    'lte-router': 'LTE Router',
    'sd-wan-appliance': 'SD-WAN Appliance',
    // Compute and Virtualization (Phase 4)
    'hypervisor': 'Hypervisor',
    'virtual-machine': 'Virtual Machine',
    'container-host': 'Container Host',
    'blade-chassis': 'Blade Chassis',
    'blade-server': 'Blade Server',
    'server-rack': 'Server Rack',
    'thin-client': 'Thin Client',
    'gpu-server': 'GPU Server',
    // Storage (Phase 4)
    'san-switch': 'SAN Switch',
    'tape-library': 'Tape Library',
    'backup-appliance': 'Backup Appliance',
    'object-storage': 'Object Storage',
    // Power and Environmental (Phase 4)
    'ups': 'UPS',
    'pdu': 'PDU',
    'environmental-sensor': 'Env. Sensor',
    'generator': 'Generator',
    'cooling-unit': 'Cooling Unit',
    // Unified Communications (Phase 4)
    'pbx-server': 'PBX Server',
    'sbc': 'Session Border Controller',
    'voip-gateway': 'VoIP Gateway',
    'video-conference-unit': 'Video Conf. Unit',
    // Industrial OT (Phase 4)
    'rtu': 'RTU',
    'dcs': 'DCS',
    'sis-controller': 'SIS Controller',
    'historian-server': 'Historian Server',
    'scada-server': 'SCADA Server',
    'ied': 'IED',
    'protocol-converter': 'Protocol Converter',
    'data-diode': 'Data Diode',
    // Physical Security (Phase 4)
    'nvr': 'NVR',
    'dvr': 'DVR',
    'video-analytics-server': 'Video Analytics',
    'license-plate-reader': 'LPR Camera',
    'intrusion-panel': 'Intrusion Panel',
    'fire-panel-gateway': 'Fire Panel GW',
    // Smart Building (Phase 4)
    'bas-controller': 'BAS Controller',
    'hvac-controller': 'HVAC Controller',
    'lighting-controller': 'Lighting Controller',
    'energy-meter': 'Energy Meter',
    'bacnet-router': 'BACnet Router',
    'elevator-controller': 'Elevator Controller',
    // Healthcare (Phase 4)
    'medical-device': 'Medical Device',
    'infusion-pump': 'Infusion Pump',
    'patient-monitor': 'Patient Monitor',
    'emr-server': 'EMR Server',
    'pacs-server': 'PACS Server',
    'nurse-call-server': 'Nurse Call Server',
    // Cloud and Internet (Phase 4)
    'cloud-aws': 'AWS Cloud',
    'cloud-azure': 'Azure Cloud',
    'cloud-gcp': 'GCP Cloud',
    'cloud-m365': 'Microsoft 365',
    'cloud-saas': 'SaaS',
    'colocation-fabric': 'Colocation Fabric',
    'isp-handoff': 'ISP Handoff',
  }
  return labels[deviceType] || 'Device'
}
