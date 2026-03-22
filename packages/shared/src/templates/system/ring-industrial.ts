import type { NetForgeTemplate } from '../../types/index.js'

export const ringIndustrialTemplate: NetForgeTemplate = {
  id: 'tmpl-ring-industrial-001',
  slug: 'ring-industrial',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Ring Topology — Industrial Automation',
    category: 'industrial',
    description: 'Closed ring topology for industrial automation. PROFINET protocol on PLC connections. SCADA gateway air-gapped from internet. Ring survives single switch failure.',
    tags: ['industrial', 'ring', 'plc', 'scada', 'profinet', 'automation'],
    difficulty: 'intermediate',
    deviceCount: 14,
    thumbnail: '',
    notes: 'Flat 172.16.100.0/24 segment. Ring switches provide single-failure redundancy. SCADA GW is intentionally NOT connected to internet.',
    validationExpected: 'warnings',
  },
  topology: {
    nodes: [
      // Industrial ring switches (6 in closed ring)
      { id: 'ri-sw1', type: 'switch-l2', position: { x: 400, y: 80 }, data: {
        hostname: 'IND-SW-01', label: 'Ring Switch 1', deviceType: 'switch-l2',
        ipAddress: '172.16.100.1/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      { id: 'ri-sw2', type: 'switch-l2', position: { x: 600, y: 180 }, data: {
        hostname: 'IND-SW-02', label: 'Ring Switch 2', deviceType: 'switch-l2',
        ipAddress: '172.16.100.2/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      { id: 'ri-sw3', type: 'switch-l2', position: { x: 640, y: 360 }, data: {
        hostname: 'IND-SW-03', label: 'Ring Switch 3', deviceType: 'switch-l2',
        ipAddress: '172.16.100.3/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      { id: 'ri-sw4', type: 'switch-l2', position: { x: 480, y: 500 }, data: {
        hostname: 'IND-SW-04', label: 'Ring Switch 4', deviceType: 'switch-l2',
        ipAddress: '172.16.100.4/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      { id: 'ri-sw5', type: 'switch-l2', position: { x: 260, y: 500 }, data: {
        hostname: 'IND-SW-05', label: 'Ring Switch 5', deviceType: 'switch-l2',
        ipAddress: '172.16.100.5/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      { id: 'ri-sw6', type: 'switch-l2', position: { x: 160, y: 360 }, data: {
        hostname: 'IND-SW-06', label: 'Ring Switch 6', deviceType: 'switch-l2',
        ipAddress: '172.16.100.6/24', subnet: '172.16.100.0/24',
        manufacturer: 'Hirschmann', model: 'RS20',
      }},
      // PLCs (3 units)
      { id: 'ri-plc1', type: 'plc', position: { x: 700, y: 100 }, data: {
        hostname: 'PLC-01', label: 'PLC 1', deviceType: 'plc',
        ipAddress: '172.16.100.10/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', manufacturer: 'Siemens', model: 'S7-1500',
        role: 'main-controller',
      }},
      { id: 'ri-plc2', type: 'plc', position: { x: 760, y: 300 }, data: {
        hostname: 'PLC-02', label: 'PLC 2', deviceType: 'plc',
        ipAddress: '172.16.100.11/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', manufacturer: 'Siemens', model: 'S7-1200',
        role: 'line-controller',
      }},
      { id: 'ri-plc3', type: 'plc', position: { x: 540, y: 620 }, data: {
        hostname: 'PLC-03', label: 'PLC 3', deviceType: 'plc',
        ipAddress: '172.16.100.12/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', manufacturer: 'Siemens', model: 'S7-1200',
        role: 'auxiliary-controller',
      }},
      // HMIs (2 units)
      { id: 'ri-hmi1', type: 'hmi', position: { x: 160, y: 200 }, data: {
        hostname: 'HMI-01', label: 'HMI Station 1', deviceType: 'hmi',
        ipAddress: '172.16.100.20/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', manufacturer: 'Siemens', model: 'TP1900',
      }},
      { id: 'ri-hmi2', type: 'hmi', position: { x: 100, y: 480 }, data: {
        hostname: 'HMI-02', label: 'HMI Station 2', deviceType: 'hmi',
        ipAddress: '172.16.100.21/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', manufacturer: 'Siemens', model: 'TP700',
      }},
      // Engineering station
      { id: 'ri-eng', type: 'workstation', position: { x: 400, y: -40 }, data: {
        hostname: 'ENG-WS-01', label: 'Engineering Station', deviceType: 'workstation',
        ipAddress: '172.16.100.30/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', os: 'Windows 11', role: 'engineering-workstation',
      }},
      // Historian server
      { id: 'ri-hist', type: 'server', position: { x: 160, y: 620 }, data: {
        hostname: 'HIST-SRV-01', label: 'Historian Server', deviceType: 'server',
        ipAddress: '172.16.100.40/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', os: 'Windows Server 2022',
        role: 'historian', manufacturer: 'OSIsoft',
      }},
      // SCADA gateway (air-gapped - NOT connected to internet)
      { id: 'ri-scada', type: 'server', position: { x: 300, y: -40 }, data: {
        hostname: 'SCADA-GW-01', label: 'SCADA Gateway', deviceType: 'server',
        ipAddress: '172.16.100.50/24', subnet: '172.16.100.0/24',
        defaultGateway: '172.16.100.1', os: 'Windows Server 2019',
        role: 'scada-gateway', notes: 'Air-gapped: intentionally NOT connected to internet',
      }},
    ],
    edges: [
      // Ring connections (closed loop - sw6 back to sw1 closes the ring)
      { id: 'ri-ring1', source: 'ri-sw1', target: 'ri-sw2', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-ring2', source: 'ri-sw2', target: 'ri-sw3', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-ring3', source: 'ri-sw3', target: 'ri-sw4', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-ring4', source: 'ri-sw4', target: 'ri-sw5', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-ring5', source: 'ri-sw5', target: 'ri-sw6', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-ring6', source: 'ri-sw6', target: 'ri-sw1', data: { mediaType: 'fiber', speed: '1G', status: 'active', protocol: 'PROFINET', label: 'Ring closes here' } },
      // PLCs to switches
      { id: 'ri-e7', source: 'ri-sw2', target: 'ri-plc1', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-e8', source: 'ri-sw3', target: 'ri-plc2', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      { id: 'ri-e9', source: 'ri-sw4', target: 'ri-plc3', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      // HMIs to switches
      { id: 'ri-e10', source: 'ri-sw6', target: 'ri-hmi1', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'ri-e11', source: 'ri-sw5', target: 'ri-hmi2', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      // Engineering, historian, SCADA to ring
      { id: 'ri-e12', source: 'ri-sw1', target: 'ri-eng', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ri-e13', source: 'ri-sw5', target: 'ri-hist', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ri-e14', source: 'ri-sw1', target: 'ri-scada', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.85 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'ri-sim-1', name: 'HMI-1 can reach PLC-1', type: 'reachability',
      sourceNodeId: 'ri-hmi1', targetNodeId: 'ri-plc1', expectedResult: 'pass',
      description: 'HMI operators should be able to reach PLCs for control',
    },
    {
      id: 'ri-sim-2', name: 'Ring survives one switch failure', type: 'redundancy-failover',
      sourceNodeId: 'ri-hmi1', targetNodeId: 'ri-plc1', expectedResult: 'pass',
      description: 'Ring topology provides alternate path when one switch fails',
    },
    {
      id: 'ri-sim-3', name: 'Engineering station can reach Historian', type: 'reachability',
      sourceNodeId: 'ri-eng', targetNodeId: 'ri-hist', expectedResult: 'pass',
      description: 'Engineers need access to historical data',
    },
    {
      id: 'ri-sim-4', name: 'SCADA gateway cannot reach internet', type: 'internet-access',
      sourceNodeId: 'ri-scada', targetNodeId: 'ri-scada', expectedResult: 'fail',
      description: 'SCADA gateway is air-gapped — internet access should FAIL',
    },
  ],
}
