import type { NetForgeTemplate } from '../../types/index.js'

export const hybridEnterpriseTemplate: NetForgeTemplate = {
  id: 'tmpl-hybrid-enterprise-001',
  slug: 'hybrid-enterprise',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Hybrid Enterprise Network',
    category: 'hybrid-cloud',
    description: 'On-prem LAN with DMZ, cloud services (M365, AWS), and remote VPN users. Firewall enforces zone separation between corp, DMZ, and servers. Multi-VLAN with inter-VLAN routing.',
    tags: ['hybrid-cloud', 'dmz', 'vpn', 'vlan', 'firewall', 'cloud'],
    difficulty: 'advanced',
    deviceCount: 22,
    thumbnail: '',
    notes: 'Cloud nodes are symbolic (internet type). VPN gateway in DMZ. Firewall controls corp/DMZ/server zone access.',
    validationExpected: 'warnings',
  },
  topology: {
    nodes: [
      // Internet + Cloud nodes
      { id: 'he-internet', type: 'internet', position: { x: 480, y: -60 }, data: { hostname: 'Internet', label: 'Internet', deviceType: 'internet' } },
      { id: 'he-m365', type: 'internet', position: { x: 300, y: -60 }, data: {
        hostname: 'M365', label: 'Microsoft 365', deviceType: 'internet',
        role: 'cloud-saas', notes: 'Symbolic cloud node — Microsoft 365 SaaS',
      }},
      { id: 'he-aws', type: 'internet', position: { x: 660, y: -60 }, data: {
        hostname: 'AWS-App', label: 'AWS App', deviceType: 'internet',
        role: 'cloud-iaas', notes: 'Symbolic cloud node — AWS hosted application',
      }},
      // Firewall (zones: internet/DMZ/LAN)
      { id: 'he-fw', type: 'firewall', position: { x: 480, y: 80 }, data: {
        hostname: 'FW-01', label: 'Enterprise Firewall', deviceType: 'firewall',
        ipAddress: '192.168.200.1/24', subnet: '192.168.200.0/24',
        vlanId: 200, role: 'zone-firewall', manufacturer: 'Palo Alto', model: 'PA-220',
        dhcpServer: true, dnsServer: true,
      }},
      // DMZ zone devices
      { id: 'he-vpn-gw', type: 'server', position: { x: 280, y: 200 }, data: {
        hostname: 'VPN-GW-01', label: 'VPN Gateway', deviceType: 'server',
        ipAddress: '192.168.50.10/24', subnet: '192.168.50.0/24',
        defaultGateway: '192.168.50.1', vlanId: 50, role: 'vpn-gateway',
        os: 'Ubuntu Server 22.04',
      }},
      { id: 'he-web-srv', type: 'server', position: { x: 400, y: 200 }, data: {
        hostname: 'WEB-SRV-01', label: 'Web Server (DMZ)', deviceType: 'server',
        ipAddress: '192.168.50.11/24', subnet: '192.168.50.0/24',
        defaultGateway: '192.168.50.1', vlanId: 50, role: 'web-server',
        os: 'Ubuntu Server 22.04',
      }},
      // L3 Core switch (LAN)
      { id: 'he-core-sw', type: 'switch-l3', position: { x: 600, y: 200 }, data: {
        hostname: 'CORE-SW-01', label: 'L3 Core Switch', deviceType: 'switch-l3',
        ipAddress: '192.168.200.10/24', subnet: '192.168.200.0/24',
        interVlanRouting: true, vlanTrunkPorts: [10, 20, 30, 60, 200],
        manufacturer: 'Cisco', model: 'Catalyst 9300',
      }},
      // Access switches
      { id: 'he-acc-sw1', type: 'switch-l2', position: { x: 500, y: 340 }, data: {
        hostname: 'ACC-SW-01', label: 'Access Switch 1', deviceType: 'switch-l2',
        ipAddress: '192.168.200.20/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 200], manufacturer: 'Cisco',
      }},
      { id: 'he-acc-sw2', type: 'switch-l2', position: { x: 700, y: 340 }, data: {
        hostname: 'ACC-SW-02', label: 'Access Switch 2', deviceType: 'switch-l2',
        ipAddress: '192.168.200.21/24', subnet: '192.168.200.0/24',
        vlanTrunkPorts: [10, 20, 200], manufacturer: 'Cisco',
      }},
      // Server zone (VLAN 60)
      { id: 'he-file-srv', type: 'server', position: { x: 760, y: 200 }, data: {
        hostname: 'FILE-SRV-01', label: 'File Server', deviceType: 'server',
        ipAddress: '192.168.60.10/24', subnet: '192.168.60.0/24',
        defaultGateway: '192.168.60.1', vlanId: 60, role: 'file-server',
        os: 'Windows Server 2022',
      }},
      { id: 'he-ad-srv', type: 'server', position: { x: 860, y: 200 }, data: {
        hostname: 'AD-SRV-01', label: 'AD Server', deviceType: 'server',
        ipAddress: '192.168.60.11/24', subnet: '192.168.60.0/24',
        defaultGateway: '192.168.60.1', vlanId: 60, role: 'domain-controller',
        os: 'Windows Server 2022', dnsServer: true,
      }},
      { id: 'he-app-srv', type: 'server', position: { x: 960, y: 200 }, data: {
        hostname: 'APP-SRV-01', label: 'App Server', deviceType: 'server',
        ipAddress: '192.168.60.12/24', subnet: '192.168.60.0/24',
        defaultGateway: '192.168.60.1', vlanId: 60, role: 'app-server',
        os: 'Ubuntu Server 22.04',
      }},
      // Workstations (VLAN 10)
      { id: 'he-ws1', type: 'workstation', position: { x: 420, y: 460 }, data: {
        hostname: 'WS-01', label: 'Workstation 1', deviceType: 'workstation',
        ipAddress: '192.168.10.10/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'he-ws2', type: 'workstation', position: { x: 540, y: 460 }, data: {
        hostname: 'WS-02', label: 'Workstation 2', deviceType: 'workstation',
        ipAddress: '192.168.10.11/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'he-ws3', type: 'workstation', position: { x: 660, y: 460 }, data: {
        hostname: 'WS-03', label: 'Workstation 3', deviceType: 'workstation',
        ipAddress: '192.168.10.12/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      { id: 'he-ws4', type: 'workstation', position: { x: 780, y: 460 }, data: {
        hostname: 'WS-04', label: 'Workstation 4', deviceType: 'workstation',
        ipAddress: '192.168.10.13/24', subnet: '192.168.10.0/24',
        defaultGateway: '192.168.10.1', vlanId: 10, os: 'Windows 11',
      }},
      // VoIP (VLAN 20)
      { id: 'he-voip1', type: 'voip-phone', position: { x: 460, y: 560 }, data: {
        hostname: 'VOIP-01', label: 'VoIP Phone 1', deviceType: 'voip-phone',
        ipAddress: '192.168.20.10/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      { id: 'he-voip2', type: 'voip-phone', position: { x: 720, y: 560 }, data: {
        hostname: 'VOIP-02', label: 'VoIP Phone 2', deviceType: 'voip-phone',
        ipAddress: '192.168.20.11/24', subnet: '192.168.20.0/24',
        defaultGateway: '192.168.20.1', vlanId: 20, poe: true,
      }},
      // Wireless APs
      { id: 'he-ap1', type: 'wireless-ap', position: { x: 500, y: 560 }, data: {
        hostname: 'AP-CORP-01', label: 'Corp AP 1', deviceType: 'wireless-ap',
        ipAddress: '192.168.200.50/24', subnet: '192.168.200.0/24',
        vlanId: 10, role: 'corporate-ap', poe: true,
      }},
      { id: 'he-ap2', type: 'wireless-ap', position: { x: 760, y: 560 }, data: {
        hostname: 'AP-GUEST-01', label: 'Guest AP', deviceType: 'wireless-ap',
        ipAddress: '192.168.200.51/24', subnet: '192.168.200.0/24',
        vlanId: 30, role: 'guest-ap', poe: true,
      }},
      // Remote VPN workstations
      { id: 'he-vpn-ws1', type: 'workstation', position: { x: 140, y: 200 }, data: {
        hostname: 'VPN-WS-01', label: 'Remote VPN User 1', deviceType: 'workstation',
        ipAddress: '10.99.0.10/24', subnet: '10.99.0.0/24',
        defaultGateway: '10.99.0.1', role: 'vpn-client', os: 'Windows 11',
      }},
      { id: 'he-vpn-ws2', type: 'workstation', position: { x: 140, y: 300 }, data: {
        hostname: 'VPN-WS-02', label: 'Remote VPN User 2', deviceType: 'workstation',
        ipAddress: '10.99.0.11/24', subnet: '10.99.0.0/24',
        defaultGateway: '10.99.0.1', role: 'vpn-client', os: 'macOS 14',
      }},
    ],
    edges: [
      { id: 'he-e1', source: 'he-internet', target: 'he-fw', data: { mediaType: 'wan', speed: 'variable', status: 'active' } },
      { id: 'he-e2', source: 'he-fw', target: 'he-m365', data: { mediaType: 'wan', speed: 'variable', label: 'HTTPS/443', protocol: 'HTTPS', status: 'active' } },
      { id: 'he-e3', source: 'he-fw', target: 'he-aws', data: { mediaType: 'wan', speed: 'variable', label: 'HTTPS/443', protocol: 'HTTPS', status: 'active' } },
      { id: 'he-e4', source: 'he-fw', target: 'he-vpn-gw', data: { mediaType: 'fiber', speed: '1G', vlanTag: 50, status: 'active' } },
      { id: 'he-e5', source: 'he-fw', target: 'he-web-srv', data: { mediaType: 'fiber', speed: '1G', vlanTag: 50, status: 'active' } },
      { id: 'he-e6', source: 'he-fw', target: 'he-core-sw', data: { mediaType: 'fiber', speed: '10G', trunkVlans: [10, 20, 30, 60, 200], uplink: true, status: 'active' } },
      { id: 'he-e7', source: 'he-vpn-ws1', target: 'he-vpn-gw', data: { mediaType: 'vpn', speed: 'variable', label: 'VPN/SSL', protocol: 'SSL-VPN', status: 'active' } },
      { id: 'he-e8', source: 'he-vpn-ws2', target: 'he-vpn-gw', data: { mediaType: 'vpn', speed: 'variable', label: 'VPN/SSL', protocol: 'SSL-VPN', status: 'active' } },
      { id: 'he-e9', source: 'he-core-sw', target: 'he-file-srv', data: { mediaType: 'fiber', speed: '10G', vlanTag: 60, status: 'active' } },
      { id: 'he-e10', source: 'he-core-sw', target: 'he-ad-srv', data: { mediaType: 'fiber', speed: '10G', vlanTag: 60, status: 'active' } },
      { id: 'he-e11', source: 'he-core-sw', target: 'he-app-srv', data: { mediaType: 'fiber', speed: '10G', vlanTag: 60, status: 'active' } },
      { id: 'he-e12', source: 'he-core-sw', target: 'he-acc-sw1', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      { id: 'he-e13', source: 'he-core-sw', target: 'he-acc-sw2', data: { mediaType: 'fiber', speed: '1G', trunkVlans: [10, 20, 30, 200], uplink: true, status: 'active' } },
      { id: 'he-e14', source: 'he-acc-sw1', target: 'he-ws1', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'he-e15', source: 'he-acc-sw1', target: 'he-ws2', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'he-e16', source: 'he-acc-sw1', target: 'he-voip1', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'he-e17', source: 'he-acc-sw1', target: 'he-ap1', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, poe: true, status: 'active' } },
      { id: 'he-e18', source: 'he-acc-sw2', target: 'he-ws3', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'he-e19', source: 'he-acc-sw2', target: 'he-ws4', data: { mediaType: 'copper', speed: '1G', vlanTag: 10, status: 'active' } },
      { id: 'he-e20', source: 'he-acc-sw2', target: 'he-voip2', data: { mediaType: 'copper', speed: '100M', vlanTag: 20, poe: true, status: 'active' } },
      { id: 'he-e21', source: 'he-acc-sw2', target: 'he-ap2', data: { mediaType: 'copper', speed: '1G', vlanTag: 30, poe: true, status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.75 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'he-sim-1', name: 'Corp WS can reach App Server', type: 'reachability',
      sourceNodeId: 'he-ws1', targetNodeId: 'he-app-srv', expectedResult: 'pass',
      description: 'Workstation on VLAN 10 should reach app server on VLAN 60 via inter-VLAN routing',
    },
    {
      id: 'he-sim-2', name: 'Corp WS can reach M365 cloud', type: 'internet-access',
      sourceNodeId: 'he-ws1', targetNodeId: 'he-m365', expectedResult: 'pass',
      description: 'Corp workstations should have access to Microsoft 365 via firewall',
    },
    {
      id: 'he-sim-3', name: 'Remote VPN user can reach App Server', type: 'reachability',
      sourceNodeId: 'he-vpn-ws1', targetNodeId: 'he-app-srv', expectedResult: 'pass',
      description: 'VPN users should access internal app server through VPN gateway',
    },
    {
      id: 'he-sim-4', name: 'DMZ Web Server cannot reach Corp LAN', type: 'isolation',
      sourceNodeId: 'he-web-srv', targetNodeId: 'he-ws1', expectedResult: 'pass',
      description: 'DMZ server must NOT be able to initiate connections to internal corp LAN',
    },
    {
      id: 'he-sim-5', name: 'Guest WiFi isolated from Corp VLAN', type: 'isolation',
      sourceNodeId: 'he-ap2', targetNodeId: 'he-ws1', expectedResult: 'pass',
      description: 'Guest AP on VLAN 30 should be isolated from corp workstations on VLAN 10',
    },
    {
      id: 'he-sim-6', name: 'Corp WS can reach internet', type: 'internet-access',
      sourceNodeId: 'he-ws1', targetNodeId: 'he-internet', expectedResult: 'pass',
      description: 'Standard internet access through firewall for corp users',
    },
  ],
}
