import { z } from 'zod'

export const DeviceTypeSchema = z.enum([
  'firewall', 'switch-l2', 'switch-l3', 'router', 'server',
  'workstation', 'printer', 'wireless-ap', 'camera', 'voip-phone',
  'nas', 'internet', 'plc', 'sensor', 'patch-panel', 'hmi', 'firewall-edge'
])

export const PortMappingSchema = z.object({
  portId: z.string(),
  portName: z.string(),
  portType: z.enum(['access', 'trunk', 'uplink', 'management', 'wan', 'lan']),
  vlanId: z.number().optional(),
  trunkVlans: z.array(z.number()).optional(),
  speed: z.string().optional(),
  connected: z.boolean().optional(),
})

export const DeviceDataSchema = z.object({
  hostname: z.string().min(1),
  deviceType: DeviceTypeSchema,
  label: z.string().min(1),
  ipAddress: z.string().optional(),
  subnet: z.string().optional(),
  defaultGateway: z.string().optional(),
  vlanId: z.number().optional(),
  vlanTrunkPorts: z.array(z.number()).optional(),
  interVlanRouting: z.boolean().optional(),
  dhcpServer: z.boolean().optional(),
  dnsServer: z.boolean().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  role: z.string().optional(),
  os: z.string().optional(),
  firmware: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  rackPosition: z.string().optional(),
  portMappings: z.array(PortMappingSchema).optional(),
})

export const ConnectionDataSchema = z.object({
  sourcePort: z.string().optional(),
  targetPort: z.string().optional(),
  mediaType: z.enum(['copper', 'fiber', 'wireless', 'sfp', 'wan', 'vpn']).optional(),
  speed: z.enum(['10M', '100M', '1G', '10G', 'variable']).optional(),
  vlanTag: z.number().optional(),
  trunkVlans: z.array(z.number()).optional(),
  poe: z.boolean().optional(),
  uplink: z.boolean().optional(),
  status: z.enum(['active', 'planned', 'deprecated', 'simulated-down']).optional(),
  notes: z.string().optional(),
  label: z.string().optional(),
  protocol: z.string().optional(),
})

export const DeviceNodeSchema = z.object({
  id: z.string(),
  type: DeviceTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: DeviceDataSchema,
})

export const ConnectionEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: ConnectionDataSchema,
})

export const TopologySnapshotSchema = z.object({
  nodes: z.array(DeviceNodeSchema),
  edges: z.array(ConnectionEdgeSchema),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }),
  metadata: z.object({
    gridEnabled: z.boolean(),
    snapToGrid: z.boolean(),
    theme: z.string(),
  }),
})

export const SimulationTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['reachability', 'isolation', 'path-trace', 'internet-access', 'redundancy-failover']),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  expectedResult: z.enum(['pass', 'fail']),
  description: z.string().optional(),
})

export const SimulationRunRequestSchema = z.object({
  topology: TopologySnapshotSchema,
  tests: z.array(SimulationTestSchema),
})

export const ValidationRunRequestSchema = z.object({
  topology: TopologySnapshotSchema,
})
