import type { NetForgeTemplate } from '../../types/index.js'

export const starOfficeTemplate: NetForgeTemplate = {
  id: 'tmpl-star-office-001',
  slug: 'star-office',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Star Topology — Office Network',
    category: 'office-it',
    description: 'Classic office star topology with VLAN segmentation, inter-VLAN routing via L3 core switch, firewall, and internet access. Suitable for small to medium offices.',
    tags: ['office', 'vlan', 'firewall', 'voip', 'inter-vlan'],
    difficulty: 'beginner',
    deviceCount: 15,
    thumbnail: '',
    notes: 'VLANs: 10=DATA, 20=VOICE, 30=GUEST, 40=SERVERS, 99=MGMT. Inter-VLAN routing via L3 core switch.',
    validationExpected: 'pass',
  },
  topology: {
    nodes: [
      // Internet
      { id: 'so-internet', type: 'internet', position: { x: 400, y: 20 }, data: { hostname: 'ISP', label: 'Internet', deviceType: 'internet' } },
      // Firewall
      { id: 'so-fw', type: 'firewall', position: { x: 400, y: 120 }, data: {
        hostname: 'FW-01', label: 'Firewall', deviceType: 'firewall',
        ipAddress: '192.168.99.1/24', subnet: '192.168.99.0/24',
        vlanId: 99, manufacturer: 'Cisco', model: 'FTD 1010',
        role: 'gateway', dhcpServer: true, dnsServer: true,
      }},
      // L3 Core Switch
      { id: 'so-sw-core', type: 'switch-l3', position: { x: 400, y: 240 }, data: {
        hostname: 'SW-CORE-01', label: 'L3 Core Switch', deviceType: 'switch-l3',
        ipAddress: '192.168.99.2/24', subnet: '192.168.99.0/24',
        interVlanRouting: true, vlanTrunkPorts: [10, 20, 30, 40, 99],
        manufacturer: 'Cisco', model: 'Catalyst 3850',
      }},
      // Access Switch 1
      { id: 'so-sw-acc1', type: 'switch-l2', position: { x: 200, y: 380 }, data: {
        hostname: 'SW-ACC-01', label: 'Access Switch 1', deviceType: 'switch-l2',
        ipAddress: '192.168.99.10/24', subnet: '192.168.99.0/24',
        vlanTrunkPorts: [10, 20, 99], manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      // Access Switch 2
      { id: 'so-sw-acc2', type: 'switch-l2', position: { x: 600, y: 380 }, data: {
        hostname: 'SW-ACC-02', label: 'Access Switch 2', deviceType: 'switch-l2',
        ipAddress: '192.168.99.11/24', subnet: '192.168.99.0/24',
        vlanTrunkPorts: [10, 20, 30, 99], manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      // Wireless AP 1
      { id: 'so-ap1', type: 'wireless-ap', position: { x: 100, y: 500 }, data: {
        hostname: 'AP-01', label: 'AP Floor 1', deviceType: 'wireless-ap',
        ipAddress: '192.168.99.20/24', subnet: '192.168.99.0/24',
        vlanId: 30, manufacturer: 'Cisco', model: 'Aironet 3800',
      }},
      // Wireless AP 2
      { id: 'so-ap2', type: 'wireless-ap', position: { x: 700, y: 500 }, data: {
        hostname: 'AP-02', label: 'AP Floor 2', deviceType: 'wireless-ap',
        ipAddress: '192.168.99.21/24', subnet: '192.168.99.0/24',
        vlanId: 30, manufacturer: 'Cisco', model: 'Aironet 3800',
      }},
      // Workstations (VLAN 10)
      { id: 'so-ws1', type: 'workstation', position: { x: 80, y: 620 }, data: {
        hostname: 'WS-01', label: 'Workstation 1', deviceType: 'workstation',
        ipAddress: '192.168.10.11/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'so-ws2', type: 'workstation', position: { x: 200, y: 620 }, data: {
        hostname: 'WS-02', label: 'Workstation 2', deviceType: 'workstation',
        ipAddress: '192.168.10.12/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'so-ws3', type: 'workstation', position: { x: 500, y: 620 }, data: {
        hostname: 'WS-03', label: 'Workstation 3', deviceType: 'workstation',
        ipAddress: '192.168.10.13/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'so-ws4', type: 'workstation', position: { x: 620, y: 620 }, data: {
        hostname: 'WS-04', label: 'Workstation 4', deviceType: 'workstation',
        ipAddress: '192.168.10.14/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      // VoIP Phones (VLAN 20)
      { id: 'so-voip1', type: 'voip-phone', position: { x: 320, y: 500 }, data: {
        hostname: 'VOIP-01', label: 'VoIP Phone 1', deviceType: 'voip-phone',
        ipAddress: '192.168.20.11/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, manufacturer: 'Cisco',
      }},
      { id: 'so-voip2', type: 'voip-phone', position: { x: 480, y: 500 }, data: {
        hostname: 'VOIP-02', label: 'VoIP Phone 2', deviceType: 'voip-phone',
        ipAddress: '192.168.20.12/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, manufacturer: 'Cisco',
      }},
      // Printer (VLAN 10)
      { id: 'so-prt', type: 'printer', position: { x: 340, y: 620 }, data: {
        hostname: 'PRT-01', label: 'Network Printer', deviceType: 'printer',
        ipAddress: '192.168.10.50/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, manufacturer: 'HP',
      }},
      // File Server (VLAN 40)
      { id: 'so-srv', type: 'server', position: { x: 400, y: 500 }, data: {
        hostname: 'SRV-FILE-01', label: 'File Server', deviceType: 'server',
        ipAddress: '192.168.40.10/24', subnet: '192.168.40.0/24',
        defaultGateway: '192.168.40.1', vlanId: 40,
        os: 'Windows Server 2022', role: 'file-server', dhcpServer: false,
      }},
    ],
    edges: [
      { id: 'so-e1', source: 'so-internet', target: 'so-fw', data: { mediaType: 'wan', speed: 'variable', status: 'active', label: 'WAN' } },
      { id: 'so-e2', source: 'so-fw', target: 'so-sw-core', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30, 40, 99], uplink: true, status: 'active' } },
      { id: 'so-e3', source: 'so-sw-core', target: 'so-sw-acc1', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 99], uplink: true, status: 'active' } },
      { id: 'so-e4', source: 'so-sw-core', target: 'so-sw-acc2', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30, 99], uplink: true, status: 'active' } },
      { id: 'so-e5', source: 'so-sw-acc1', target: 'so-ap1', data: { mediaType: 'copper', speed: '1G', vlanTag: 30, poe: true, status: 'active' } },
      { id: 'so-e6', source: 'so-sw-acc2', target: 'so-ap2', data: { mediaType: 'copper', speed: '1G', vlanTag: 30, poe: true, status: 'active' } },
      { id: 'so-e7', source: 'so-sw-acc1', target: 'so-ws1', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'so-e8', source: 'so-sw-acc1', target: 'so-ws2', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'so-e9', source: 'so-sw-acc2', target: 'so-ws3', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'so-e10', source: 'so-sw-acc2', target: 'so-ws4', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'so-e11', source: 'so-sw-acc1', target: 'so-voip1', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'so-e12', source: 'so-sw-acc2', target: 'so-voip2', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'so-e13', source: 'so-sw-acc1', target: 'so-prt', data: { mediaType: 'copper', speed: '100M', vlanTag: 10, status: 'active' } },
      { id: 'so-e14', source: 'so-sw-core', target: 'so-srv', data: { mediaType: 'fiber', speed: '1G', vlanTag: 40, status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.85 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'so-sim-1', name: 'WS-01 can reach File Server', type: 'reachability',
      sourceNodeId: 'so-ws1', targetNodeId: 'so-srv', expectedResult: 'pass',
      description: 'Workstation on VLAN 10 should be able to reach file server on VLAN 40 via inter-VLAN routing on L3 core switch',
    },
    {
      id: 'so-sim-2', name: 'WS-01 can reach internet', type: 'internet-access',
      sourceNodeId: 'so-ws1', targetNodeId: 'so-internet', expectedResult: 'pass',
      description: 'Workstations should have internet access through the firewall',
    },
    {
      id: 'so-sim-3', name: 'VoIP-01 can reach WS-01', type: 'reachability',
      sourceNodeId: 'so-voip1', targetNodeId: 'so-ws1', expectedResult: 'pass',
      description: 'VoIP phone on VLAN 20 should reach workstation on VLAN 10 via inter-VLAN routing',
    },
    {
      id: 'so-sim-4', name: 'Guest AP is isolated from VLAN 10', type: 'isolation',
      sourceNodeId: 'so-ap1', targetNodeId: 'so-ws1', expectedResult: 'pass',
      description: 'Guest SSID AP (VLAN 30) should NOT be able to reach corporate workstations (VLAN 10)',
    },
  ],
}
