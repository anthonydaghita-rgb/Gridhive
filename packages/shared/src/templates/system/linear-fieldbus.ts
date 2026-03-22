import type { NetForgeTemplate } from '../../types/index.js'

export const linearFieldbusTemplate: NetForgeTemplate = {
  id: 'tmpl-linear-fieldbus-001',
  slug: 'linear-fieldbus',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Linear Topology — Industrial Fieldbus',
    category: 'industrial',
    description: 'Strictly linear daisy-chain fieldbus topology. No redundancy. One link failure isolates all downstream devices. Simple but fragile — good for non-critical sensor lines.',
    tags: ['industrial', 'fieldbus', 'linear', 'daisy-chain', 'sensors'],
    difficulty: 'beginner',
    deviceCount: 14,
    thumbnail: '',
    notes: 'IMPORTANT: This topology has NO redundancy. Any single link failure breaks connectivity to all downstream devices. Consider ring or mesh for critical systems.',
    validationExpected: 'warnings',
  },
  topology: {
    nodes: [
      // Control server at head of chain
      { id: 'lf-ctrl', type: 'server', position: { x: 80, y: 300 }, data: {
        hostname: 'CTRL-SRV-01', label: 'Control Server', deviceType: 'server',
        ipAddress: '10.50.0.1/24', subnet: '10.50.0.0/24',
        os: 'Windows Server 2022', role: 'fieldbus-controller',
        dhcpServer: true, dnsServer: true,
      }},
      // Industrial switches in chain (4 switches)
      { id: 'lf-sw1', type: 'switch-l2', position: { x: 220, y: 300 }, data: {
        hostname: 'FIELD-SW-01', label: 'Field Switch 1', deviceType: 'switch-l2',
        ipAddress: '10.50.0.10/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', manufacturer: 'Phoenix Contact',
      }},
      { id: 'lf-sw2', type: 'switch-l2', position: { x: 380, y: 300 }, data: {
        hostname: 'FIELD-SW-02', label: 'Field Switch 2', deviceType: 'switch-l2',
        ipAddress: '10.50.0.11/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', manufacturer: 'Phoenix Contact',
      }},
      { id: 'lf-sw3', type: 'switch-l2', position: { x: 540, y: 300 }, data: {
        hostname: 'FIELD-SW-03', label: 'Field Switch 3', deviceType: 'switch-l2',
        ipAddress: '10.50.0.12/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', manufacturer: 'Phoenix Contact',
      }},
      { id: 'lf-sw4', type: 'switch-l2', position: { x: 700, y: 300 }, data: {
        hostname: 'FIELD-SW-04', label: 'Field Switch 4', deviceType: 'switch-l2',
        ipAddress: '10.50.0.13/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', manufacturer: 'Phoenix Contact',
      }},
      // Sensor controllers (8 units, 2 per switch)
      { id: 'lf-sc1', type: 'sensor', position: { x: 180, y: 420 }, data: {
        hostname: 'SC-01', label: 'Sensor Controller 1', deviceType: 'sensor',
        ipAddress: '10.50.0.20/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc2', type: 'sensor', position: { x: 260, y: 420 }, data: {
        hostname: 'SC-02', label: 'Sensor Controller 2', deviceType: 'sensor',
        ipAddress: '10.50.0.21/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc3', type: 'sensor', position: { x: 340, y: 420 }, data: {
        hostname: 'SC-03', label: 'Sensor Controller 3', deviceType: 'sensor',
        ipAddress: '10.50.0.22/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc4', type: 'sensor', position: { x: 420, y: 420 }, data: {
        hostname: 'SC-04', label: 'Sensor Controller 4', deviceType: 'sensor',
        ipAddress: '10.50.0.23/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc5', type: 'sensor', position: { x: 500, y: 420 }, data: {
        hostname: 'SC-05', label: 'Sensor Controller 5', deviceType: 'sensor',
        ipAddress: '10.50.0.24/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc6', type: 'sensor', position: { x: 580, y: 420 }, data: {
        hostname: 'SC-06', label: 'Sensor Controller 6', deviceType: 'sensor',
        ipAddress: '10.50.0.25/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc7', type: 'sensor', position: { x: 660, y: 420 }, data: {
        hostname: 'SC-07', label: 'Sensor Controller 7', deviceType: 'sensor',
        ipAddress: '10.50.0.26/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      { id: 'lf-sc8', type: 'sensor', position: { x: 740, y: 420 }, data: {
        hostname: 'SC-08', label: 'Sensor Controller 8', deviceType: 'sensor',
        ipAddress: '10.50.0.27/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'sensor-controller',
      }},
      // EOL Terminator (end of line)
      { id: 'lf-eol', type: 'sensor', position: { x: 860, y: 300 }, data: {
        hostname: 'EOL-TERM', label: 'EOL Terminator', deviceType: 'sensor',
        ipAddress: '10.50.0.99/24', subnet: '10.50.0.0/24',
        defaultGateway: '10.50.0.1', role: 'end-of-line-terminator',
        notes: 'End-of-line terminator. No outbound connections beyond this point.',
      }},
    ],
    edges: [
      // Linear chain: ctrl -> sw1 -> sw2 -> sw3 -> sw4 -> eol
      { id: 'lf-chain1', source: 'lf-ctrl', target: 'lf-sw1', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'lf-chain2', source: 'lf-sw1', target: 'lf-sw2', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'lf-chain3', source: 'lf-sw2', target: 'lf-sw3', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'lf-chain4', source: 'lf-sw3', target: 'lf-sw4', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'lf-chain5', source: 'lf-sw4', target: 'lf-eol', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      // Sensor controllers to their switches
      { id: 'lf-e6', source: 'lf-sw1', target: 'lf-sc1', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e7', source: 'lf-sw1', target: 'lf-sc2', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e8', source: 'lf-sw2', target: 'lf-sc3', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e9', source: 'lf-sw2', target: 'lf-sc4', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e10', source: 'lf-sw3', target: 'lf-sc5', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e11', source: 'lf-sw3', target: 'lf-sc6', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e12', source: 'lf-sw4', target: 'lf-sc7', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'lf-e13', source: 'lf-sw4', target: 'lf-sc8', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.9 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'lf-sim-1', name: 'Control Server can reach Sensor Controller 8', type: 'reachability',
      sourceNodeId: 'lf-ctrl', targetNodeId: 'lf-sc8', expectedResult: 'pass',
      description: 'End-to-end reachability through the full linear chain',
    },
    {
      id: 'lf-sim-2', name: 'Chain breaks when Switch 2 is removed', type: 'redundancy-failover',
      sourceNodeId: 'lf-ctrl', targetNodeId: 'lf-sc8', expectedResult: 'fail',
      description: 'No alternate path exists — downstream sensors become unreachable',
    },
  ],
}
