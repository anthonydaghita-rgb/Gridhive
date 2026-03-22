import type { NetForgeTemplate } from '../../types/index.js'

export const treeCampusTemplate: NetForgeTemplate = {
  id: 'tmpl-tree-campus-001',
  slug: 'tree-campus',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Tree Topology — Campus Enterprise',
    category: 'campus-enterprise',
    description: 'Three-tier campus network: redundant core L3 switches, distribution layer, and access layer. VoIP, wireless, and server support across two buildings.',
    tags: ['campus', 'enterprise', 'three-tier', 'redundant-core', 'vlan', 'voip'],
    difficulty: 'advanced',
    deviceCount: 30,
    thumbnail: '',
    notes: 'Core switches are paired with redundant inter-switch link. VLANs: 10=CORP, 20=VOICE, 30=WLAN, 100=SERVERS, 200=MGMT.',
    validationExpected: 'pass',
  },
  topology: {
    nodes: [
      // Internet + Firewall
      { id: 'tc-internet', type: 'internet', position: { x: 600, y: -60 }, data: { hostname: 'Internet', label: 'Internet', deviceType: 'internet' } },
      { id: 'tc-fw', type: 'firewall', position: { x: 600, y: 60 }, data: {
        hostname: 'FW-01', label: 'Campus Firewall', deviceType: 'firewall',
        ipAddress: '192.168.200.1/24', subnet: '192.168.200.0/24',
        vlanId: 200, role: 'gateway', manufacturer: 'Palo Alto', dhcpServer: false, dnsServer: false,
      }},
      // Core switches (redundant pair)
      { id: 'tc-core1', type: 'switch-l3', position: { x: 460, y: 180 }, data: {
        hostname: 'CORE-SW-01', label: 'Core Switch 1', deviceType: 'switch-l3',
        ipAddress: '192.168.200.10/24', subnet: '192.168.200.0/24',
        interVlanRouting: true, vlanTrunkPorts: [10, 20, 30, 100, 200],
        manufacturer: 'Cisco', model: 'Catalyst 9500',
      }},
      { id: 'tc-core2', type: 'switch-l3', position: { x: 740, y: 180 }, data: {
        hostname: 'CORE-SW-02', label: 'Core Switch 2', deviceType: 'switch-l3',
        ipAddress: '192.168.200.11/24', subnet: '192.168.200.0/24',
        interVlanRouting: true, vlanTrunkPorts: [10, 20, 30, 100, 200],
        manufacturer: 'Cisco', model: 'Catalyst 9500',
      }},
      // Distribution switches - Building A (2 units)
      { id: 'tc-dist-a1', type: 'switch-l2', position: { x: 280, y: 320 }, data: {
        hostname: 'DIST-A-SW-01', label: 'Dist A-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.20/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 30, 200], manufacturer: 'Cisco', model: 'Catalyst 9300',
      }},
      { id: 'tc-dist-a2', type: 'switch-l2', position: { x: 460, y: 320 }, data: {
        hostname: 'DIST-A-SW-02', label: 'Dist A-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.21/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 200], manufacturer: 'Cisco', model: 'Catalyst 9300',
      }},
      // Distribution switches - Building B (2 units)
      { id: 'tc-dist-b1', type: 'switch-l2', position: { x: 740, y: 320 }, data: {
        hostname: 'DIST-B-SW-01', label: 'Dist B-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.22/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 30, 200], manufacturer: 'Cisco', model: 'Catalyst 9300',
      }},
      { id: 'tc-dist-b2', type: 'switch-l2', position: { x: 920, y: 320 }, data: {
        hostname: 'DIST-B-SW-02', label: 'Dist B-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.23/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 200], manufacturer: 'Cisco', model: 'Catalyst 9300',
      }},
      // Access switches (8 units - 2 per distribution switch)
      { id: 'tc-acc-a1', type: 'switch-l2', position: { x: 180, y: 460 }, data: {
        hostname: 'ACC-A1-SW-01', label: 'Access A1-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.30/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-a2', type: 'switch-l2', position: { x: 320, y: 460 }, data: {
        hostname: 'ACC-A1-SW-02', label: 'Access A1-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.31/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-a3', type: 'switch-l2', position: { x: 420, y: 460 }, data: {
        hostname: 'ACC-A2-SW-01', label: 'Access A2-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.32/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-a4', type: 'switch-l2', position: { x: 520, y: 460 }, data: {
        hostname: 'ACC-A2-SW-02', label: 'Access A2-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.33/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-b1', type: 'switch-l2', position: { x: 660, y: 460 }, data: {
        hostname: 'ACC-B1-SW-01', label: 'Access B1-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.34/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-b2', type: 'switch-l2', position: { x: 800, y: 460 }, data: {
        hostname: 'ACC-B1-SW-02', label: 'Access B1-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.35/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-b3', type: 'switch-l2', position: { x: 880, y: 460 }, data: {
        hostname: 'ACC-B2-SW-01', label: 'Access B2-1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.36/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      { id: 'tc-acc-b4', type: 'switch-l2', position: { x: 1000, y: 460 }, data: {
        hostname: 'ACC-B2-SW-02', label: 'Access B2-2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.37/24', subnet: '192.168.200.0/24',
        manufacturer: 'Cisco', model: 'Catalyst 2960',
      }},
      // Workstations (8 - one per access switch conceptually, 2 shown)
      { id: 'tc-ws-a1', type: 'workstation', position: { x: 140, y: 580 }, data: {
        hostname: 'WS-BLDG-A-01', label: 'Building A WS 1', deviceType: 'workstation',
        ipAddress: '192.168.10.20/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'tc-ws-a2', type: 'workstation', position: { x: 240, y: 580 }, data: {
        hostname: 'WS-BLDG-A-02', label: 'Building A WS 2', deviceType: 'workstation',
        ipAddress: '192.168.10.21/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'tc-ws-b1', type: 'workstation', position: { x: 860, y: 580 }, data: {
        hostname: 'WS-BLDG-B-01', label: 'Building B WS 1', deviceType: 'workstation',
        ipAddress: '192.168.10.40/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      // VoIP phones (4 total)
      { id: 'tc-voip-a1', type: 'voip-phone', position: { x: 360, y: 580 }, data: {
        hostname: 'VOIP-A-01', label: 'VoIP A-1', deviceType: 'voip-phone',
        ipAddress: '192.168.20.10/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      { id: 'tc-voip-a2', type: 'voip-phone', position: { x: 460, y: 580 }, data: {
        hostname: 'VOIP-A-02', label: 'VoIP A-2', deviceType: 'voip-phone',
        ipAddress: '192.168.20.11/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      { id: 'tc-voip-b1', type: 'voip-phone', position: { x: 700, y: 580 }, data: {
        hostname: 'VOIP-B-01', label: 'VoIP B-1', deviceType: 'voip-phone',
        ipAddress: '192.168.20.20/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      { id: 'tc-voip-b2', type: 'voip-phone', position: { x: 800, y: 580 }, data: {
        hostname: 'VOIP-B-02', label: 'VoIP B-2', deviceType: 'voip-phone',
        ipAddress: '192.168.20.21/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      // Wireless APs (4)
      { id: 'tc-ap-a1', type: 'wireless-ap', position: { x: 180, y: 580 }, data: {
        hostname: 'AP-BLDG-A-01', label: 'AP Building A-1', deviceType: 'wireless-ap',
        ipAddress: '192.168.200.50/24', subnet: '192.168.200.0/24',
        vlanId: 30, poe: true,
      }},
      { id: 'tc-ap-b1', type: 'wireless-ap', position: { x: 960, y: 580 }, data: {
        hostname: 'AP-BLDG-B-01', label: 'AP Building B-1', deviceType: 'wireless-ap',
        ipAddress: '192.168.200.51/24', subnet: '192.168.200.0/24',
        vlanId: 30, poe: true,
      }},
      // Servers (3 - connected directly to core)
      { id: 'tc-srv1', type: 'server', position: { x: 540, y: 180 }, data: {
        hostname: 'SRV-FILE-01', label: 'File Server', deviceType: 'server',
        ipAddress: '192.168.100.10/24', subnet: '192.168.100.0/24',
        defaultGateway: '192.168.100.1', vlanId: 100, role: 'file-server',
        os: 'Windows Server 2022',
      }},
      { id: 'tc-srv2', type: 'server', position: { x: 620, y: 180 }, data: {
        hostname: 'SRV-AD-01', label: 'AD Server', deviceType: 'server',
        ipAddress: '192.168.100.11/24', subnet: '192.168.100.0/24',
        defaultGateway: '192.168.100.1', vlanId: 100, role: 'domain-controller',
        os: 'Windows Server 2022', dnsServer: true,
      }},
      { id: 'tc-srv3', type: 'server', position: { x: 700, y: 180 }, data: {
        hostname: 'SRV-APP-01', label: 'App Server', deviceType: 'server',
        ipAddress: '192.168.100.12/24', subnet: '192.168.100.0/24',
        defaultGateway: '192.168.100.1', vlanId: 100, role: 'app-server',
        os: 'Ubuntu Server 22.04',
      }},
    ],
    edges: [
      // Internet -> FW -> Core
      { id: 'tc-e1', source: 'tc-internet', target: 'tc-fw', data: { mediaType: 'wan', speed: 'variable', status: 'active' } },
      { id: 'tc-e2', source: 'tc-fw', target: 'tc-core1', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 100, 200], uplink: true, status: 'active' } },
      { id: 'tc-e3', source: 'tc-fw', target: 'tc-core2', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 100, 200], uplink: true, status: 'active' } },
      // Core-to-core redundant link
      { id: 'tc-e4', source: 'tc-core1', target: 'tc-core2', data: { mediaType: 'fiber', speed: '10G', status: 'active', label: 'Core Redundant Link' } },
      // Core to distribution (each core connects to both distribution layers)
      { id: 'tc-e5', source: 'tc-core1', target: 'tc-dist-a1', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      { id: 'tc-e6', source: 'tc-core1', target: 'tc-dist-a2', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 200], uplink: true, status: 'active' } },
      { id: 'tc-e7', source: 'tc-core2', target: 'tc-dist-b1', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      { id: 'tc-e8', source: 'tc-core2', target: 'tc-dist-b2', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 200], uplink: true, status: 'active' } },
      // Cross-connect from each core to opposite distribution (redundancy)
      { id: 'tc-e9', source: 'tc-core2', target: 'tc-dist-a1', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      { id: 'tc-e10', source: 'tc-core1', target: 'tc-dist-b1', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      // Distribution to access
      { id: 'tc-e11', source: 'tc-dist-a1', target: 'tc-acc-a1', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30], status: 'active' } },
      { id: 'tc-e12', source: 'tc-dist-a1', target: 'tc-acc-a2', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30], status: 'active' } },
      { id: 'tc-e13', source: 'tc-dist-a2', target: 'tc-acc-a3', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20], status: 'active' } },
      { id: 'tc-e14', source: 'tc-dist-a2', target: 'tc-acc-a4', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20], status: 'active' } },
      { id: 'tc-e15', source: 'tc-dist-b1', target: 'tc-acc-b1', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30], status: 'active' } },
      { id: 'tc-e16', source: 'tc-dist-b1', target: 'tc-acc-b2', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30], status: 'active' } },
      { id: 'tc-e17', source: 'tc-dist-b2', target: 'tc-acc-b3', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20], status: 'active' } },
      { id: 'tc-e18', source: 'tc-dist-b2', target: 'tc-acc-b4', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20], status: 'active' } },
      // End devices
      { id: 'tc-e19', source: 'tc-acc-a1', target: 'tc-ws-a1', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'tc-e20', source: 'tc-acc-a1', target: 'tc-ws-a2', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'tc-e21', source: 'tc-acc-a1', target: 'tc-ap-a1', data: { mediaType: 'copper', speed: '1G', vlanTag: 30, poe: true, status: 'active' } },
      { id: 'tc-e22', source: 'tc-acc-a3', target: 'tc-voip-a1', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'tc-e23', source: 'tc-acc-a4', target: 'tc-voip-a2', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'tc-e24', source: 'tc-acc-b1', target: 'tc-ws-b1', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'tc-e25', source: 'tc-acc-b2', target: 'tc-voip-b1', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'tc-e26', source: 'tc-acc-b2', target: 'tc-voip-b2', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'tc-e27', source: 'tc-acc-b3', target: 'tc-ap-b1', data: { mediaType: 'copper', speed: '1G', vlanTag: 30, poe: true, status: 'active' } },
      // Servers to core
      { id: 'tc-e28', source: 'tc-core1', target: 'tc-srv1', data: { mediaType: 'fiber', speed: '10G', vlanTag: 100, status: 'active' } },
      { id: 'tc-e29', source: 'tc-core1', target: 'tc-srv2', data: { mediaType: 'fiber', speed: '10G', vlanTag: 100, status: 'active' } },
      { id: 'tc-e30', source: 'tc-core2', target: 'tc-srv3', data: { mediaType: 'fiber', speed: '10G', vlanTag: 100, status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.65 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'tc-sim-1', name: 'Building A WS can reach Server 1', type: 'reachability',
      sourceNodeId: 'tc-ws-a1', targetNodeId: 'tc-srv1', expectedResult: 'pass',
      description: 'Workstation on VLAN 10 should reach servers on VLAN 100 via core inter-VLAN routing',
    },
    {
      id: 'tc-sim-2', name: 'Building B VoIP can reach Building A VoIP', type: 'reachability',
      sourceNodeId: 'tc-voip-b1', targetNodeId: 'tc-voip-a1', expectedResult: 'pass',
      description: 'VoIP phones across buildings communicate on VLAN 20 routed at core',
    },
    {
      id: 'tc-sim-3', name: 'Core Switch 1 fails: network still functions', type: 'redundancy-failover',
      sourceNodeId: 'tc-ws-a1', targetNodeId: 'tc-srv1', expectedResult: 'pass',
      description: 'Redundant core means traffic reroutes through Core Switch 2',
    },
    {
      id: 'tc-sim-4', name: 'Wireless client can reach internet', type: 'internet-access',
      sourceNodeId: 'tc-ap-a1', targetNodeId: 'tc-internet', expectedResult: 'pass',
      description: 'Wireless clients on VLAN 30 should have internet access',
    },
  ],
}
