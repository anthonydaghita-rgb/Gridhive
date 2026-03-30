export type DeviceType =
  | 'firewall'
  | 'switch-l2'
  | 'switch-l3'
  | 'router'
  | 'server'
  | 'workstation'
  | 'printer'
  | 'wireless-ap'
  | 'camera'
  | 'voip-phone'
  | 'nas'
  | 'internet'
  | 'plc'
  | 'sensor'
  | 'patch-panel'
  | 'hmi'
  | 'firewall-edge'
  // Access Control device types (Phase 3)
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
  // Network Infrastructure (Phase 4)
  | 'load-balancer'
  | 'wan-optimizer'
  | 'packet-broker'
  | 'network-tap'
  | 'content-filter'
  | 'ddos-scrubber'
  | 'dns-server'
  | 'radius-server'
  | 'proxy-server'
  | 'siem-server'
  | 'log-server'
  // Wireless and Cellular (Phase 4)
  | 'wireless-controller'
  | 'cellular-gateway'
  | 'cellular-modem'
  | 'satellite-modem'
  | 'lte-router'
  | 'sd-wan-appliance'
  // Compute and Virtualization (Phase 4)
  | 'hypervisor'
  | 'virtual-machine'
  | 'container-host'
  | 'blade-chassis'
  | 'blade-server'
  | 'server-rack'
  | 'thin-client'
  | 'gpu-server'
  // Storage (Phase 4)
  | 'san-switch'
  | 'tape-library'
  | 'backup-appliance'
  | 'object-storage'
  // Power and Environmental (Phase 4)
  | 'ups'
  | 'pdu'
  | 'environmental-sensor'
  | 'generator'
  | 'cooling-unit'
  // Unified Communications (Phase 4)
  | 'pbx-server'
  | 'sbc'
  | 'voip-gateway'
  | 'video-conference-unit'
  // Industrial and OT (Phase 4)
  | 'rtu'
  | 'dcs'
  | 'sis-controller'
  | 'historian-server'
  | 'scada-server'
  | 'ied'
  | 'protocol-converter'
  | 'data-diode'
  // Physical Security additions (Phase 4)
  | 'nvr'
  | 'dvr'
  | 'video-analytics-server'
  | 'license-plate-reader'
  | 'intrusion-panel'
  | 'fire-panel-gateway'
  // Smart Building (Phase 4)
  | 'bas-controller'
  | 'hvac-controller'
  | 'lighting-controller'
  | 'energy-meter'
  | 'bacnet-router'
  | 'elevator-controller'
  // Healthcare (Phase 4)
  | 'medical-device'
  | 'infusion-pump'
  | 'patient-monitor'
  | 'emr-server'
  | 'pacs-server'
  | 'nurse-call-server'
  // Cloud and Internet symbolic nodes (Phase 4)
  | 'cloud-aws'
  | 'cloud-azure'
  | 'cloud-gcp'
  | 'cloud-m365'
  | 'cloud-saas'
  | 'colocation-fabric'
  | 'isp-handoff'

// Phase 4: typed connection system
export type ConnectionType =
  // Layer 2 -- Physical and Local
  | 'ethernet-copper'
  | 'ethernet-fiber'
  | 'ethernet-sfp'
  | 'ethernet-dac'
  | 'wifi'
  | 'wifi-backhaul'
  | 'bluetooth'
  | 'serial-console'
  | 'can-bus'
  | 'fieldbus'
  | 'oob-console'
  // Layer 3 -- Routed and WAN
  | 'routed-static'
  | 'ospf'
  | 'bgp'
  | 'eigrp'
  | 'mpls'
  | 'sd-wan'
  // VPN and Tunneling
  | 'site-to-site-ipsec'
  | 'site-to-site-ssl'
  | 'ssl-vpn-client'
  | 'wireguard'
  | 'gre-tunnel'
  | 'vxlan'
  | 'geneve'
  | 'ipsec-dmvpn'
  | 'l2tp'
  // VLAN and Segmentation
  | 'trunk-8021q'
  | 'access-port'
  | 'qinq'
  | 'vlan-routing'
  // Industrial / OT
  | 'ethernet-ip'
  | 'profinet'
  | 'modbus-tcp'
  | 'dnp3'
  | 'bacnet'
  | 'opc-ua'
  | 'iec-61850'
  // Storage
  | 'iscsi'
  | 'fibre-channel'
  | 'nfs'
  | 'smb'
  // Physical Security and AV
  | 'osdp'
  | 'wiegand'
  | 'poe'
  | 'poe-plus'
  | 'poe-bt'
  | 'dante'
  | 'aes67'
  | 'smpte-st-2110'
  // Management and Monitoring
  | 'snmp'
  | 'netflow'
  | 'syslog'
  | 'restful-api'
  | 'ssh'
  | 'rdp'
  | 'fortilink'
  | 'unifi-adopt'
  // Cloud and Internet
  | 'internet-access'
  | 'saas-connection'
  | 'cloud-vpn'
  | 'direct-connect'
  | 'peering'

export interface VlanZone {
  id: string
  vlanId: number
  label?: string
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

export interface PortMapping {
  portId: string
  portName: string
  portType: 'access' | 'trunk' | 'uplink' | 'management' | 'wan' | 'lan'
  vlanId?: number
  trunkVlans?: number[]
  speed?: string
  connected?: boolean
}

export interface DeviceData {
  hostname: string
  deviceType: DeviceType
  label: string
  ipAddress?: string
  subnet?: string
  defaultGateway?: string
  vlanId?: number
  vlanTrunkPorts?: number[]
  interVlanRouting?: boolean
  dhcpServer?: boolean
  dnsServer?: boolean
  manufacturer?: string
  model?: string
  role?: string
  os?: string
  firmware?: string
  notes?: string
  location?: string
  rackPosition?: string
  portMappings?: PortMapping[]
  poe?: boolean
  // Phase 4: vendor profile reference
  vendorProfileId?: string
  // Phase 4: Scout discovery fields
  mac?: string
  confidence?: number
  scoutDiscovered?: boolean
  discoveredAt?: string
  // Phase 4: monitoring status
  monitoringStatus?: 'online' | 'offline' | 'warning' | 'unconfigured'
  // Phase 5: Rack diagram placement
  rackId?: string
  rackSlotStart?: number
  rackUHeight?: number
  rackFacing?: 'front' | 'rear'
  rackPowerDraw?: number
  rackPowerCircuit?: string
  // Phase 5: Security / LM criticality
  assetCriticality?: number   // 1-10
  isCrownJewel?: boolean
  // Phase 5: Capacity planning
  trafficProfileId?: string
  trafficProfileAvgMbps?: number
  trafficProfilePeakMbps?: number
  [key: string]: unknown
}

export type NetworkProtocol =
  // WAN and tunneling
  | 'mpls'
  | 'sd-wan'
  | 'site-to-site-vpn'
  | 'ssl-vpn'
  | 'gre-tunnel'
  | 'wireguard'
  // Routing protocols
  | 'ospf'
  | 'bgp'
  | 'eigrp'
  | 'rip'
  | 'static-route'
  // Industrial
  | 'profinet'
  | 'ethernet-ip'
  | 'modbus-tcp'
  | 'bacnet'
  | 'dnp3'
  // Storage
  | 'iscsi'
  | 'fibre-channel'
  | 'nfs'
  | 'smb'
  // Management
  | 'snmp'
  | 'netflow'
  | 'syslog'
  // Other
  | 'none'
  | 'custom'

export type ConnectionData = {
  connectionType?: ConnectionType
  sourcePort?: string
  targetPort?: string
  mediaType?: 'copper' | 'fiber' | 'wireless' | 'sfp' | 'wan' | 'vpn' | 'dac' | 'serial' | 'fc'
  speed?: '10M' | '100M' | '1G' | '10G' | '25G' | '40G' | '100G' | 'variable' | 'custom'
  vlanTag?: number
  trunkVlans?: number[]
  nativeVlan?: number
  poe?: boolean
  poeClass?: string
  uplink?: boolean
  status?: 'active' | 'planned' | 'deprecated' | 'simulated-down'
  notes?: string
  label?: string
  protocol?: string
  protocols?: NetworkProtocol[]
  customProtocol?: string
  // VPN / IPsec fields
  peerIpA?: string
  peerIpB?: string
  localSubnet?: string
  remoteSubnet?: string
  ikeVersion?: 1 | 2
  psk?: string
  phase1Proposal?: string
  phase2Proposal?: string
  // BGP fields
  localAs?: number
  remoteAs?: number
  bgpType?: 'ebgp' | 'ibgp'
  // OSPF fields
  ospfArea?: string
  ospfCost?: number
  // MPLS / SD-WAN
  providerName?: string
  circuitId?: string
  cirMbps?: number
  // WireGuard
  allowedIps?: string[]
  keepaliveInterval?: number
} & Record<string, unknown>

export interface DeviceNode {
  id: string
  type: DeviceType
  position: { x: number; y: number }
  data: DeviceData
}

export interface ConnectionEdge {
  id: string
  source: string
  target: string
  data: ConnectionData
}

export interface TopologyViewport {
  x: number
  y: number
  zoom: number
}

export interface TopologyMetadata {
  gridEnabled: boolean
  snapToGrid: boolean
  theme: string
  // Phase 4: VLAN visual system
  vlanColors?: Record<number, string>
  vlanZones?: VlanZone[]
  // Phase 5: Rack diagram
  racks?: RackDefinition[]
}

export interface TopologySnapshot {
  nodes: DeviceNode[]
  edges: ConnectionEdge[]
  viewport: TopologyViewport
  metadata: TopologyMetadata
}

export interface ValidationResult {
  id: string
  severity: 'error' | 'warning' | 'info'
  code: string
  title: string
  description: string
  recommendation: string
  affectedNodeIds: string[]
  affectedEdgeIds: string[]
}

export interface SimulationTest {
  id: string
  name: string
  type: 'reachability' | 'isolation' | 'path-trace' | 'internet-access' | 'redundancy-failover'
  sourceNodeId: string
  targetNodeId: string
  expectedResult: 'pass' | 'fail'
  description?: string
}

export interface SimulationHop {
  nodeId: string
  nodeLabel: string
  deviceType: DeviceType
  interface?: string
  vlan?: number
  note?: string
}

export interface SimulationResult {
  testId: string
  passed: boolean
  path: SimulationHop[]
  blockedAt?: string
  blockReason?: string
  warnings: string[]
  failoverPath?: SimulationHop[]
}

export type TemplateCategory =
  | 'office-it'
  | 'industrial'
  | 'iot'
  | 'campus-enterprise'
  | 'multi-site'
  | 'hybrid-cloud'
  | 'physical-security'
  | 'data-center'
  | 'specialty'
  | 'custom'

export interface TemplateMeta {
  name: string
  category: TemplateCategory
  description: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  deviceCount: number
  thumbnail: string
  notes: string
  validationExpected: 'pass' | 'warnings'
}

export interface NetForgeTemplate {
  id: string
  slug: string
  version: string
  isSystem: boolean
  orgId: string | null
  createdBy: string | null
  meta: TemplateMeta
  topology: TopologySnapshot
  simTestSuite: SimulationTest[]
}

export interface SimulationRunRequest {
  topology: TopologySnapshot
  tests: SimulationTest[]
}

export interface ValidationRunRequest {
  topology: TopologySnapshot
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export interface Project {
  id: string
  orgId: string
  name: string
  description?: string
  clientName?: string
  tags?: string[]
  folderId?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  archived: boolean
  archivedAt?: Date | null
  archivedBy?: string | null
}

export interface ProjectVersion {
  id: string
  projectId: string
  versionNumber: number
  label?: string
  topology: TopologySnapshot
  createdBy: string
  createdAt: Date
  isAutosave: boolean
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Scout Discovery types
// ─────────────────────────────────────────────────────────────

export type ScoutScanMode = 'quick' | 'standard' | 'deep'
export type ScoutDiscoveryStatus = 'pending' | 'scanning' | 'complete' | 'expired'

export interface ScoutDiscovery {
  id: string
  orgId: string
  projectId?: string | null
  createdBy: string
  scanMode: ScoutScanMode
  status: ScoutDiscoveryStatus
  startedAt?: Date | null
  completedAt?: Date | null
  summary?: ScoutSummary | null
  scoutVersion?: string | null
  hostOs?: string | null
  hostIp?: string | null
  token?: string
  wsUrl?: string
  expiresAt?: Date | null
}

export interface ScoutSummary {
  devicesFound: number
  connectionsFound: number
  vlansFound: number
  subnetsFound: number
  scanDurationSeconds: number
  scanMode: ScoutScanMode
}

export interface ScoutDeviceMessage {
  type: 'device'
  data: {
    discoveryId: string
    deviceId: string
    hostname?: string
    ipAddress?: string
    subnet?: string
    mac?: string
    manufacturer?: string
    model?: string
    deviceType: DeviceType
    os?: string
    firmware?: string
    location?: string
    vlanId?: number
    confidence: number
    discoveredAt: string
  }
}

export interface ScoutConnectionMessage {
  type: 'connection'
  data: {
    discoveryId: string
    connectionId: string
    sourceDeviceId: string
    targetDeviceId: string
    sourcePort?: string
    targetPort?: string
    mediaType?: string
    speed?: string
    vlanTag?: number
    trunkVlans?: number[]
    discoveredVia: 'lldp' | 'cdp' | 'mac-table' | 'arp' | 'manual'
    discoveredAt: string
  }
}

export interface ScoutProgressMessage {
  type: 'progress'
  data: {
    discoveryId: string
    percentComplete: number
    hostsChecked: number
    hostsTotal: number
    devicesFound: number
    connectionsFound: number
    currentSubnet?: string
    phase: 'host-discovery' | 'device-id' | 'topology' | 'vlan' | 'deep'
  }
}

export type ScoutStreamMessage =
  | ScoutDeviceMessage
  | ScoutConnectionMessage
  | { type: 'vlan'; data: Record<string, unknown> }
  | ScoutProgressMessage
  | { type: 'complete'; data: { discoveryId: string; summary: ScoutSummary } }
  | { type: 'error'; data: { message: string } }

// ─────────────────────────────────────────────────────────────
// Phase 4: Monitoring types
// ─────────────────────────────────────────────────────────────

export interface MonitoringSnapshot {
  id: string
  projectId: string
  deviceId: string
  polledAt: Date
  status: 'online' | 'offline' | 'warning'
  uptimeSeconds?: number
  cpuPct?: number
  memoryPct?: number
  data?: Record<string, unknown>
}

export interface MonitoringAlertRule {
  id: string
  projectId: string
  deviceId?: string | null
  ruleType: 'device_offline' | 'interface_down' | 'cpu_threshold' | 'memory_threshold'
  threshold?: number
  notifyEmails: string[]
  enabled: boolean
}

// ─────────────────────────────────────────────────────────────
// Phase 4: External API key types
// ─────────────────────────────────────────────────────────────

export type ApiKeyScope =
  | 'read:projects'
  | 'write:projects'
  | 'read:templates'
  | 'write:configs'
  | 'trigger:scout'
  | 'read:compliance'
  | 'write:validate'

export interface OrgApiKey {
  id: string
  orgId: string
  label: string
  scopes: ApiKeyScope[]
  createdBy: string
  createdAt: Date
  lastUsedAt?: Date | null
  expiresAt?: Date | null
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Favorites
// ─────────────────────────────────────────────────────────────

export interface UserFavorite {
  userId: string
  projectId: string
  createdAt: Date
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Project comments
// ─────────────────────────────────────────────────────────────

export interface ProjectComment {
  id: string
  projectId: string
  nodeId?: string | null
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  resolved: boolean
  user?: { id: string; name: string }
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Search index
// ─────────────────────────────────────────────────────────────

export interface ProjectSearchIndexEntry {
  projectId: string
  hostname?: string | null
  ipAddress?: string | null
  deviceType?: string | null
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Live push credential types
// ─────────────────────────────────────────────────────────────

export type LivePushVendor = 'unifi' | 'meraki' | 'fortinet' | 'panos' | 'aruba-cx'

export interface OrgApiCredential {
  id: string
  orgId: string
  vendor: LivePushVendor
  credentialType: string
  label: string
  testedAt?: Date | null
  testResult?: 'success' | 'failed' | null
  createdBy: string
  createdAt: Date
}

// ─────────────────────────────────────────────────────────────
// Phase 5: Rack Diagram (Pillar B)
// ─────────────────────────────────────────────────────────────

export interface RackDefinition {
  id: string
  name: string
  label: string
  totalUnits: number
  width: 'standard-19' | 'wall-mount-10' | 'open-frame'
  location?: string
  pduIds?: string[]
  powerCapacityWatts?: number
  notes?: string
}

// ─────────────────────────────────────────────────────────────
// Phase 5: Lateral Movement Simulation (Pillar D)
// ─────────────────────────────────────────────────────────────

export type BlastRadiusTier = 'primary' | 'secondary' | 'peripheral' | 'unreachable'

export interface LateralMovementHop {
  nodeId: string
  probability: number
  hops: number
  tier: BlastRadiusTier
  attackPath: string[]   // ordered list of nodeIds from source to this node
  criticalityScore: number
}

export interface LMRemediation {
  rank: number
  description: string
  blastRadiusReduction: number   // points
  blastRadiusPctReduction: number
  affectedNodeIds: string[]
}

export interface LateralMovementResult {
  sourceNodeId: string
  blastRadiusScore: number       // 0-1000
  maxPossibleScore: number
  criticalAssetsAtRisk: string[] // nodeIds of criticality >= 8
  devicesReachable: number
  devicesProtected: number
  totalDevices: number
  reachability: LateralMovementHop[]
  remediations: LMRemediation[]
  lmsScore: number               // 0-100 network-wide susceptibility
}

export interface WorstCaseEntry {
  rank: number
  nodeId: string
  blastRadiusScore: number
  criticalAssetsAtRisk: string[]
  devicesReachable: number
}

export interface WorstCaseResult {
  entries: WorstCaseEntry[]
  networkLmsScore: number
}

// ─────────────────────────────────────────────────────────────
// Phase 5: Capacity Planning (Pillar E)
// ─────────────────────────────────────────────────────────────

export type TrafficType =
  | 'general-web'
  | 'video-conferencing'
  | 'voip'
  | 'video-surveillance'
  | 'file-server'
  | 'remote-desktop'
  | 'backup'
  | 'database'
  | 'streaming-media'
  | 'industrial-scada'
  | 'custom'

export interface TrafficProfile {
  id: string
  name: string
  description: string
  avgBandwidthMbps: number
  peakBandwidthMbps: number
  concurrencyFactor: number
  trafficType: TrafficType
  burstDuration: 'continuous' | 'short' | 'long'
  isBuiltin?: boolean
}

export interface LinkUtilization {
  edgeId: string
  sourceNodeId: string
  targetNodeId: string
  linkSpeedMbps: number
  avgLoadMbps: number
  peakLoadMbps: number
  avgUtilizationPct: number
  peakUtilizationPct: number
  status: 'ok' | 'watch' | 'warning' | 'critical'
}

export interface CapacityBottleneck {
  edgeId: string
  description: string
  peakUtilizationPct: number
  recommendation: string
}

export interface QosRequirement {
  nodeIds: string[]
  trafficType: TrafficType
  recommendation: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface CapacityResult {
  linkUtilization: LinkUtilization[]
  bottlenecks: CapacityBottleneck[]
  qosRequirements: QosRequirement[]
  totalBandwidthAvgMbps: number
  totalBandwidthPeakMbps: number
  overloadedEdgeIds: string[]   // > 90%
  atRiskEdgeIds: string[]       // 80-90%
}

// ─────────────────────────────────────────────────────────────
// Phase 5: IPAM (Pillar A)
// ─────────────────────────────────────────────────────────────

export interface IpamNamespace {
  id: string
  orgId: string
  name: string
  description?: string
  createdBy: string
  createdAt: Date
}

export interface IpamSubnet {
  id: string
  namespaceId: string
  supernetId?: string | null
  cidr: string
  name: string
  vlanId?: number | null
  vlanName?: string | null
  gatewayIp?: string | null
  dhcpServerIp?: string | null
  dnsServerIp?: string | null
  purpose?: string | null
  status: 'active' | 'reserved' | 'deprecated' | 'planning'
  associatedProjectIds: string[]
  utilizationPct: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface IpamAddress {
  id: string
  subnetId: string
  ipAddress: string
  hostname?: string | null
  macAddress?: string | null
  deviceType?: string | null
  status: 'assigned' | 'reserved' | 'available' | 'conflict' | 'stale'
  associatedProjectId?: string | null
  associatedNodeId?: string | null
  leaseType: 'static' | 'dhcp' | 'reserved'
  lastSeen?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────
// Phase 5: Bill of Materials (Pillar C)
// ─────────────────────────────────────────────────────────────

export interface BOMLineItem {
  vendorProfileId?: string
  displayName: string
  vendor: string
  quantity: number
  unitPriceHardware: number
  totalPriceHardware: number
  licenseDescription?: string
  unitPriceLicenseAnnual?: number
  unitPriceLicenseThreeYear?: number
  totalPriceLicenseAnnual?: number
  totalPriceLicenseThreeYear?: number
  notes?: string
  priceSource: 'msrp' | 'street' | 'pax8' | 'ingram' | 'manual' | 'estimated'
}

export interface BillOfMaterials {
  lineItems: BOMLineItem[]
  hardwareSubtotal: number
  licensingAnnual: number
  licensingThreeYear: number
  grandTotalHardware: number
  grandTotalThreeYear: number
  currency: 'USD'
  priceDate: Date
  disclaimer: string
}
