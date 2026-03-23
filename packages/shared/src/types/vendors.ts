import type { DeviceType } from './index.js'

export type VendorName =
  | 'ubiquiti'
  | 'cisco-meraki'
  | 'cisco-ios'
  | 'cisco-nxos'
  | 'fortinet'
  | 'palo-alto'
  | 'aruba-hpe'
  | 'juniper'
  | 'sonicwall'
  | 'watchguard'
  | 'ruckus'
  | 'netgear-pro'
  | 'dell-emc'
  | 'extreme-networks'
  | 'hid-global'
  | 'lenel-s2'
  | 'genetec'
  | 'honeywell-ac'
  | 'bosch-ac'
  | 'avigilon'
  | 'brivo'
  | 'axis'
  | 'salto'
  | 'kisi'
  | 'ccure'
  | 'generic'

export type ConfigFormat =
  | 'unifi-json'
  | 'unifi-network-app'
  | 'meraki-api-json'
  | 'cisco-ios-cli'
  | 'cisco-nxos-cli'
  | 'cisco-ftd-xml'
  | 'fortios-cli'
  | 'fortios-json'
  | 'panos-xml'
  | 'aruba-cli'
  | 'junos-set'
  | 'sonicwall-exp'
  | 'watchguard-xml'
  | 'generic-summary'
  | 'ac-implementation-guide'

export interface DeviceSpecs {
  // Switching
  portCount?: number
  poePorts?: number
  poeWatts?: number
  uplinkPorts?: number
  sfpPorts?: number
  sfpPlusPorts?: number
  sfp28Ports?: number
  qsfpPorts?: number
  maxVlans?: number
  stackable?: boolean
  layer3Capable?: boolean
  multicastRoutingCapable?: boolean
  // Wireless
  wirelessStandard?: string
  wirelessRadios?: number
  maxSsids?: number
  maxClients?: number
  // Firewall / Gateway
  wanPorts?: number
  throughputGbps?: number
  idsIpsCapable?: boolean
  vpnThroughputGbps?: number
  maxVpnTunnels?: number
  // Physical
  rackUnits?: number
  formFactor?: 'rack' | 'desktop' | 'wall-mount' | 'din-rail' | 'outdoor' | 'ceiling' | 'in-wall'
  powerWatts?: number
  // Management
  managementProtocol?: string[]
  cloudManaged?: boolean
  // Access Control specific
  maxDoors?: number
  maxCardholders?: number
  readerPorts?: number
  inputPorts?: number
  outputPorts?: number
}

export interface ConfigFieldOption {
  value: string
  label: string
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'ip' | 'cidr' | 'mac' | 'password' | 'textarea' | 'list'
  defaultValue?: unknown
  options?: ConfigFieldOption[]
  required: boolean
  validation?: string
  helpText?: string
  vendorDocs?: string
  affectsConfigOutput: boolean
}

export interface ConfigSection {
  id: string
  title: string
  description: string
  fields: ConfigField[]
}

export interface DeviceConfigSchema {
  sections: ConfigSection[]
}

export interface VendorDeviceProfile {
  id: string
  vendor: VendorName
  productLine: string
  model: string
  displayName: string
  deviceType: DeviceType
  icon: string
  specs: DeviceSpecs
  configSchema: DeviceConfigSchema
  configFormat: ConfigFormat
  firmwareVersions: string[]
  releaseYear?: number
  eol?: boolean
  ndaaCompliant?: boolean
  notes?: string
}

// Access Control types
export type ACDeviceType =
  | 'ac-server'
  | 'ac-controller'
  | 'ac-reader'
  | 'ac-door-hardware'
  | 'ac-intercom'
  | 'ac-biometric'
  | 'ac-key-pad'
  | 'ac-visitor-kiosk'
  | 'ac-elevator-ctrl'
  | 'ac-turnstile'

export type ACPlatform =
  | 'lenel-onguard'
  | 'lenel-elements'
  | 'genetec-security-center'
  | 'ccure-9000'
  | 'honeywell-pro-watch'
  | 'honeywell-win-pak'
  | 'bosch-acs'
  | 'brivo'
  | 'kisi'
  | 'avigilon-acc'
  | 'openpath'
  | 'salto-pro-access'
  | 'hid-vr10'
  | 's2-netbox'
  | 'gallagher-command-centre'
  | 'custom'

export type ACCredentialType =
  | 'prox-card'
  | 'smart-card'
  | 'mobile-ble'
  | 'mobile-nfc'
  | 'pin'
  | 'pin-and-card'
  | 'biometric-fp'
  | 'biometric-face'
  | 'qr-code'
  | 'piv'

export interface ACDeviceData {
  doorCount?: number
  readerCount?: number
  inputCount?: number
  outputCount?: number
  controllerProtocol?: 'mercury' | 'osdp' | 'proprietary' | 'wiegand'
  acPlatform?: ACPlatform
  credentialTypes?: ACCredentialType[]
  readerProtocol?: 'wiegand' | 'osdp' | 'hid-iclass' | 'mobile-nfc'
  doorId?: string
  entryExit?: 'entry' | 'exit' | 'both'
  acSoftware?: string
  maxDoors?: number
  maxCardholders?: number
  cloudManaged?: boolean
}

// Config export result
export interface ConfigExportResult {
  deviceId: string
  vendor: VendorName
  format: ConfigFormat
  filename: string
  content: string
  warnings: string[]
  instructions: string
}

// Compliance types
export type ComplianceFrameworkId =
  | 'hipaa'
  | 'pci-dss'
  | 'nist-csf'
  | 'soc2'
  | 'cmmc-l2'
  | 'iec62443'
  | 'iso27001'
  | 'ferpa'
  | 'custom'

export interface ComplianceViolation {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  requirementId: string
  requirementName: string
  title: string
  description: string
  remediation: string
  affectedNodeIds: string[]
  affectedEdgeIds: string[]
  reference: string
}

export interface ComplianceCheck {
  id: string
  requirementId: string
  requirementName: string
  title: string
  description: string
}

export interface ComplianceReport {
  frameworkId: ComplianceFrameworkId
  frameworkName: string
  frameworkVersion: string
  ranAt: Date
  overallStatus: 'pass' | 'fail' | 'warnings'
  score?: number
  violations: ComplianceViolation[]
  warnings: ComplianceViolation[]
  passed: ComplianceCheck[]
}

export interface ComplianceRunRequest {
  topology: import('./index.js').TopologySnapshot
  frameworks: ComplianceFrameworkId[]
}
