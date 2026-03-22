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
}

export interface ConnectionData {
  sourcePort?: string
  targetPort?: string
  mediaType?: 'copper' | 'fiber' | 'wireless' | 'sfp' | 'wan' | 'vpn'
  speed?: '10M' | '100M' | '1G' | '10G' | 'variable'
  vlanTag?: number
  trunkVlans?: number[]
  poe?: boolean
  uplink?: boolean
  status?: 'active' | 'planned' | 'deprecated' | 'simulated-down'
  notes?: string
  label?: string
  protocol?: string
}

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
  createdBy: string
  createdAt: Date
  updatedAt: Date
  archived: boolean
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
