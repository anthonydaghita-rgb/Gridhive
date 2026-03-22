import type { NetForgeTemplate } from '../../types/index.js'

export const meshIotTemplate: NetForgeTemplate = {
  id: 'tmpl-mesh-iot-001',
  slug: 'mesh-iot',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Mesh Topology — IoT High-Redundancy',
    category: 'iot',
    description: 'High-redundancy mesh network for IoT deployments. Every mesh switch connects to at least 2 others. Dual gateways for failover. Designed for sensor-heavy environments.',
    tags: ['iot', 'mesh', 'redundancy', 'sensors', 'industrial-iot'],
    difficulty: 'advanced',
    deviceCount: 16,
    thumbnail: '',
    notes: 'Flat 10.10.0.0/16 addressing. No VLAN segmentation at mesh layer — validation will warn about this by design.',
    validationExpected: 'warnings',
  },
  topology: {
    nodes: [
      // Gateways
      { id: 'mi-gw1', type: 'router', position: { x: 300, y: 40 }, data: {
        hostname: 'GW-01', label: 'Gateway 1', deviceType: 'router',
        ipAddress: '10.10.0.1/16', subnet: '10.10.0.0/16',
        role: 'iot-gateway', manufacturer: 'Cisco', dhcpServer: true,
      }},
      { id: 'mi-gw2', type: 'router', position: { x: 500, y: 40 }, data: {
        hostname: 'GW-02', label: 'Gateway 2', deviceType: 'router',
        ipAddress: '10.10.0.2/16', subnet: '10.10.0.0/16',
        role: 'iot-gateway', manufacturer: 'Cisco',
      }},
      // Internet
      { id: 'mi-internet', type: 'internet', position: { x: 400, y: -60 }, data: {
        hostname: 'Internet', label: 'Internet', deviceType: 'internet',
      }},
      // Mesh switches (5 nodes in mesh topology)
      { id: 'mi-sw1', type: 'switch-l2', position: { x: 200, y: 160 }, data: {
        hostname: 'MESH-SW-01', label: 'Mesh Switch 1', deviceType: 'switch-l2',
        ipAddress: '10.10.1.1/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Cisco',
      }},
      { id: 'mi-sw2', type: 'switch-l2', position: { x: 400, y: 160 }, data: {
        hostname: 'MESH-SW-02', label: 'Mesh Switch 2', deviceType: 'switch-l2',
        ipAddress: '10.10.1.2/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Cisco',
      }},
      { id: 'mi-sw3', type: 'switch-l2', position: { x: 600, y: 160 }, data: {
        hostname: 'MESH-SW-03', label: 'Mesh Switch 3', deviceType: 'switch-l2',
        ipAddress: '10.10.1.3/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Cisco',
      }},
      { id: 'mi-sw4', type: 'switch-l2', position: { x: 300, y: 300 }, data: {
        hostname: 'MESH-SW-04', label: 'Mesh Switch 4', deviceType: 'switch-l2',
        ipAddress: '10.10.1.4/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Cisco',
      }},
      { id: 'mi-sw5', type: 'switch-l2', position: { x: 500, y: 300 }, data: {
        hostname: 'MESH-SW-05', label: 'Mesh Switch 5', deviceType: 'switch-l2',
        ipAddress: '10.10.1.5/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Cisco',
      }},
      // IoT Sensors (6 sensors)
      { id: 'mi-sensor1', type: 'sensor', position: { x: 80, y: 420 }, data: {
        hostname: 'SENSOR-01', label: 'IoT Sensor 1', deviceType: 'sensor',
        ipAddress: '10.10.2.1/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'temperature-sensor',
      }},
      { id: 'mi-sensor2', type: 'sensor', position: { x: 200, y: 420 }, data: {
        hostname: 'SENSOR-02', label: 'IoT Sensor 2', deviceType: 'sensor',
        ipAddress: '10.10.2.2/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'humidity-sensor',
      }},
      { id: 'mi-sensor3', type: 'sensor', position: { x: 320, y: 420 }, data: {
        hostname: 'SENSOR-03', label: 'IoT Sensor 3', deviceType: 'sensor',
        ipAddress: '10.10.2.3/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'pressure-sensor',
      }},
      { id: 'mi-sensor4', type: 'sensor', position: { x: 440, y: 420 }, data: {
        hostname: 'SENSOR-04', label: 'IoT Sensor 4', deviceType: 'sensor',
        ipAddress: '10.10.2.4/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'motion-sensor',
      }},
      { id: 'mi-sensor5', type: 'sensor', position: { x: 560, y: 420 }, data: {
        hostname: 'SENSOR-05', label: 'IoT Sensor 5', deviceType: 'sensor',
        ipAddress: '10.10.2.5/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'door-sensor',
      }},
      { id: 'mi-sensor6', type: 'sensor', position: { x: 680, y: 420 }, data: {
        hostname: 'SENSOR-06', label: 'IoT Sensor 6', deviceType: 'sensor',
        ipAddress: '10.10.2.6/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'light-sensor',
      }},
      // NAS
      { id: 'mi-nas', type: 'nas', position: { x: 200, y: 540 }, data: {
        hostname: 'NAS-01', label: 'IoT NAS Storage', deviceType: 'nas',
        ipAddress: '10.10.3.1/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', manufacturer: 'Synology', role: 'data-storage',
      }},
      // Management server
      { id: 'mi-mgmt', type: 'server', position: { x: 400, y: 540 }, data: {
        hostname: 'MGMT-SRV-01', label: 'Mgmt Server', deviceType: 'server',
        ipAddress: '10.10.3.2/16', subnet: '10.10.0.0/16',
        defaultGateway: '10.10.0.1', role: 'iot-management',
        os: 'Ubuntu Server 22.04', dnsServer: true,
      }},
    ],
    edges: [
      // Gateways to internet
      { id: 'mi-e1', source: 'mi-internet', target: 'mi-gw1', data: { mediaType: 'wan', speed: 'variable', status: 'active' } },
      { id: 'mi-e2', source: 'mi-internet', target: 'mi-gw2', data: { mediaType: 'wan', speed: 'variable', status: 'active' } },
      // Gateways to mesh fabric (each gateway connects to multiple switches)
      { id: 'mi-e3', source: 'mi-gw1', target: 'mi-sw1', data: { mediaType: 'fiber', speed: '1G', uplink: true, status: 'active' } },
      { id: 'mi-e4', source: 'mi-gw1', target: 'mi-sw2', data: { mediaType: 'fiber', speed: '1G', uplink: true, status: 'active' } },
      { id: 'mi-e5', source: 'mi-gw2', target: 'mi-sw2', data: { mediaType: 'fiber', speed: '1G', uplink: true, status: 'active' } },
      { id: 'mi-e6', source: 'mi-gw2', target: 'mi-sw3', data: { mediaType: 'fiber', speed: '1G', uplink: true, status: 'active' } },
      // Mesh inter-switch links (ring + cross-connects for redundancy)
      { id: 'mi-e7', source: 'mi-sw1', target: 'mi-sw2', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e8', source: 'mi-sw2', target: 'mi-sw3', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e9', source: 'mi-sw1', target: 'mi-sw4', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e10', source: 'mi-sw2', target: 'mi-sw4', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e11', source: 'mi-sw2', target: 'mi-sw5', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e12', source: 'mi-sw3', target: 'mi-sw5', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      { id: 'mi-e13', source: 'mi-sw4', target: 'mi-sw5', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      // Sensors to nearest switches
      { id: 'mi-e14', source: 'mi-sw1', target: 'mi-sensor1', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'mi-e15', source: 'mi-sw1', target: 'mi-sensor2', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'mi-e16', source: 'mi-sw4', target: 'mi-sensor3', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'mi-e17', source: 'mi-sw4', target: 'mi-sensor4', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'mi-e18', source: 'mi-sw5', target: 'mi-sensor5', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'mi-e19', source: 'mi-sw3', target: 'mi-sensor6', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      // NAS and management to switches
      { id: 'mi-e20', source: 'mi-sw4', target: 'mi-nas', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'mi-e21', source: 'mi-sw5', target: 'mi-mgmt', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.9 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'mi-sim-1', name: 'Sensor-1 can reach NAS', type: 'reachability',
      sourceNodeId: 'mi-sensor1', targetNodeId: 'mi-nas', expectedResult: 'pass',
      description: 'IoT sensor should be able to store data to the NAS',
    },
    {
      id: 'mi-sim-2', name: 'Sensor-1 to NAS survives Mesh-SW-3 failure', type: 'redundancy-failover',
      sourceNodeId: 'mi-sensor1', targetNodeId: 'mi-nas', expectedResult: 'pass',
      description: 'Mesh redundancy means connectivity continues when one switch fails',
    },
    {
      id: 'mi-sim-3', name: 'Sensor-1 can reach internet via Gateway-1', type: 'internet-access',
      sourceNodeId: 'mi-sensor1', targetNodeId: 'mi-internet', expectedResult: 'pass',
      description: 'Sensors should have internet access for cloud telemetry uploads',
    },
    {
      id: 'mi-sim-4', name: 'Sensors can reach Mgmt Server', type: 'reachability',
      sourceNodeId: 'mi-sensor1', targetNodeId: 'mi-mgmt', expectedResult: 'pass',
      description: 'Sensors and management server are on same flat network (known design)',
    },
  ],
}
