import type { NetForgeTemplate } from '../../types/index.js'

export const hubSpokeBranchTemplate: NetForgeTemplate = {
  id: 'tmpl-hub-spoke-001',
  slug: 'hub-spoke-branch',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Hub-and-Spoke — Multi-Branch',
    category: 'multi-site',
    description: 'Multi-site WAN topology with HQ, three branches, and remote VPN users. All branch traffic routes through HQ firewall.',
    tags: ['wan', 'mpls', 'vpn', 'multi-site', 'branch'],
    difficulty: 'intermediate',
    deviceCount: 25,
    thumbnail: '',
    notes: 'HQ: 10.0.0.0/24. Branch-1: 10.1.0.0/24. Branch-2: 10.2.0.0/24. Branch-3: 10.3.0.0/24. Remote VPN: 10.99.0.0/24.',
    validationExpected: 'pass',
  },
  topology: {
    nodes: [
      // Internet
      { id: 'hs-internet', type: 'internet', position: { x: 600, y: 20 }, data: { hostname: 'ISP', label: 'Internet', deviceType: 'internet' } },
      // HQ Firewall
      { id: 'hs-hq-fw', type: 'firewall', position: { x: 600, y: 120 }, data: {
        hostname: 'HQ-FW-01', label: 'HQ Firewall', deviceType: 'firewall',
        ipAddress: '10.0.0.1/24', subnet: '10.0.0.0/24',
        defaultGateway: '203.0.113.1', role: 'gateway',
        dhcpServer: true, dnsServer: true, manufacturer: 'Cisco',
      }},
      // HQ L3 Core Switch
      { id: 'hs-hq-sw', type: 'switch-l3', position: { x: 600, y: 240 }, data: {
        hostname: 'HQ-SW-CORE', label: 'HQ Core Switch', deviceType: 'switch-l3',
        ipAddress: '10.0.0.2/24', subnet: '10.0.0.0/24',
        interVlanRouting: true, manufacturer: 'Cisco',
      }},
      // HQ Servers
      { id: 'hs-hq-file', type: 'server', position: { x: 480, y: 360 }, data: {
        hostname: 'HQ-SRV-FILE', label: 'File Server', deviceType: 'server',
        ipAddress: '10.0.0.10/24', subnet: '10.0.0.0/24',
        defaultGateway: '10.0.0.1', vlanId: 10, role: 'file-server',
      }},
      { id: 'hs-hq-ad', type: 'server', position: { x: 600, y: 360 }, data: {
        hostname: 'HQ-SRV-AD', label: 'AD Server', deviceType: 'server',
        ipAddress: '10.0.0.11/24', subnet: '10.0.0.0/24',
        defaultGateway: '10.0.0.1', vlanId: 10, role: 'domain-controller',
        dnsServer: true,
      }},
      { id: 'hs-hq-app', type: 'server', position: { x: 720, y: 360 }, data: {
        hostname: 'HQ-SRV-APP', label: 'App Server', deviceType: 'server',
        ipAddress: '10.0.0.12/24', subnet: '10.0.0.0/24',
        defaultGateway: '10.0.0.1', vlanId: 10, role: 'app-server',
      }},
      // HQ Workstations
      { id: 'hs-hq-ws1', type: 'workstation', position: { x: 480, y: 460 }, data: {
        hostname: 'HQ-WS-01', label: 'HQ Workstation 1', deviceType: 'workstation',
        ipAddress: '10.0.0.20/24', subnet: '10.0.0.0/24',
        defaultGateway: '10.0.0.1', os: 'Windows 11',
      }},
      { id: 'hs-hq-ws2', type: 'workstation', position: { x: 720, y: 460 }, data: {
        hostname: 'HQ-WS-02', label: 'HQ Workstation 2', deviceType: 'workstation',
        ipAddress: '10.0.0.21/24', subnet: '10.0.0.0/24',
        defaultGateway: '10.0.0.1', os: 'Windows 11',
      }},
      // Branch 1
      { id: 'hs-b1-rtr', type: 'router', position: { x: 120, y: 240 }, data: {
        hostname: 'B1-RTR-01', label: 'Branch 1 Router', deviceType: 'router',
        ipAddress: '10.1.0.1/24', subnet: '10.1.0.0/24',
        role: 'edge-router', manufacturer: 'Cisco', model: 'ISR 4321',
      }},
      { id: 'hs-b1-sw', type: 'switch-l2', position: { x: 120, y: 360 }, data: {
        hostname: 'B1-SW-01', label: 'Branch 1 Switch', deviceType: 'switch-l2',
        ipAddress: '10.1.0.2/24', subnet: '10.1.0.0/24',
      }},
      { id: 'hs-b1-ws1', type: 'workstation', position: { x: 40, y: 460 }, data: {
        hostname: 'B1-WS-01', label: 'B1 Workstation 1', deviceType: 'workstation',
        ipAddress: '10.1.0.10/24', subnet: '10.1.0.0/24',
        defaultGateway: '10.1.0.1', os: 'Windows 11',
      }},
      { id: 'hs-b1-ws2', type: 'workstation', position: { x: 160, y: 460 }, data: {
        hostname: 'B1-WS-02', label: 'B1 Workstation 2', deviceType: 'workstation',
        ipAddress: '10.1.0.11/24', subnet: '10.1.0.0/24',
        defaultGateway: '10.1.0.1', os: 'Windows 11',
      }},
      { id: 'hs-b1-prt', type: 'printer', position: { x: 100, y: 560 }, data: {
        hostname: 'B1-PRT-01', label: 'B1 Printer', deviceType: 'printer',
        ipAddress: '10.1.0.50/24', subnet: '10.1.0.0/24',
        defaultGateway: '10.1.0.1',
      }},
      { id: 'hs-b1-ap', type: 'wireless-ap', position: { x: 220, y: 460 }, data: {
        hostname: 'B1-AP-01', label: 'B1 Wireless AP', deviceType: 'wireless-ap',
        ipAddress: '10.1.0.5/24', subnet: '10.1.0.0/24',
      }},
      // Branch 2
      { id: 'hs-b2-rtr', type: 'router', position: { x: 600, y: 560 }, data: {
        hostname: 'B2-RTR-01', label: 'Branch 2 Router', deviceType: 'router',
        ipAddress: '10.2.0.1/24', subnet: '10.2.0.0/24',
        role: 'edge-router', manufacturer: 'Cisco',
      }},
      { id: 'hs-b2-sw', type: 'switch-l2', position: { x: 600, y: 660 }, data: {
        hostname: 'B2-SW-01', label: 'Branch 2 Switch', deviceType: 'switch-l2',
        ipAddress: '10.2.0.2/24', subnet: '10.2.0.0/24',
      }},
      { id: 'hs-b2-ws1', type: 'workstation', position: { x: 520, y: 760 }, data: {
        hostname: 'B2-WS-01', label: 'B2 Workstation 1', deviceType: 'workstation',
        ipAddress: '10.2.0.10/24', subnet: '10.2.0.0/24',
        defaultGateway: '10.2.0.1', os: 'Windows 11',
      }},
      { id: 'hs-b2-ws2', type: 'workstation', position: { x: 640, y: 760 }, data: {
        hostname: 'B2-WS-02', label: 'B2 Workstation 2', deviceType: 'workstation',
        ipAddress: '10.2.0.11/24', subnet: '10.2.0.0/24',
        defaultGateway: '10.2.0.1', os: 'Windows 11',
      }},
      { id: 'hs-b2-ap', type: 'wireless-ap', position: { x: 760, y: 760 }, data: {
        hostname: 'B2-AP-01', label: 'B2 Wireless AP', deviceType: 'wireless-ap',
        ipAddress: '10.2.0.5/24', subnet: '10.2.0.0/24',
      }},
      // Branch 3
      { id: 'hs-b3-rtr', type: 'router', position: { x: 1080, y: 240 }, data: {
        hostname: 'B3-RTR-01', label: 'Branch 3 Router', deviceType: 'router',
        ipAddress: '10.3.0.1/24', subnet: '10.3.0.0/24',
        role: 'edge-router', manufacturer: 'Cisco',
      }},
      { id: 'hs-b3-sw', type: 'switch-l2', position: { x: 1080, y: 360 }, data: {
        hostname: 'B3-SW-01', label: 'Branch 3 Switch', deviceType: 'switch-l2',
        ipAddress: '10.3.0.2/24', subnet: '10.3.0.0/24',
      }},
      { id: 'hs-b3-ws', type: 'workstation', position: { x: 1080, y: 460 }, data: {
        hostname: 'B3-WS-01', label: 'B3 Workstation', deviceType: 'workstation',
        ipAddress: '10.3.0.10/24', subnet: '10.3.0.0/24',
        defaultGateway: '10.3.0.1', os: 'Windows 11',
      }},
      // Remote VPN users
      { id: 'hs-vpn-ws1', type: 'workstation', position: { x: 860, y: 20 }, data: {
        hostname: 'VPN-WS-01', label: 'Remote VPN User 1', deviceType: 'workstation',
        ipAddress: '10.99.0.10/24', subnet: '10.99.0.0/24',
        defaultGateway: '10.0.0.1', role: 'vpn-client', os: 'Windows 11',
      }},
      { id: 'hs-vpn-ws2', type: 'workstation', position: { x: 1000, y: 20 }, data: {
        hostname: 'VPN-WS-02', label: 'Remote VPN User 2', deviceType: 'workstation',
        ipAddress: '10.99.0.11/24', subnet: '10.99.0.0/24',
        defaultGateway: '10.0.0.1', role: 'vpn-client', os: 'Windows 11',
      }},
    ],
    edges: [
      { id: 'hs-e1', source: 'hs-internet', target: 'hs-hq-fw', data: { mediaType: 'wan', speed: 'variable', label: 'WAN', status: 'active' } },
      { id: 'hs-e2', source: 'hs-hq-fw', target: 'hs-hq-sw', data: { mediaType: 'fiber', speed: '1G', uplink: true, status: 'active' } },
      { id: 'hs-e3', source: 'hs-hq-sw', target: 'hs-hq-file', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e4', source: 'hs-hq-sw', target: 'hs-hq-ad', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e5', source: 'hs-hq-sw', target: 'hs-hq-app', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e6', source: 'hs-hq-sw', target: 'hs-hq-ws1', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e7', source: 'hs-hq-sw', target: 'hs-hq-ws2', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      // Branch 1 WAN link
      { id: 'hs-e8', source: 'hs-hq-fw', target: 'hs-b1-rtr', data: { mediaType: 'wan', speed: '1G', label: 'MPLS', protocol: 'MPLS', status: 'active' } },
      { id: 'hs-e9', source: 'hs-b1-rtr', target: 'hs-b1-sw', data: { mediaType: 'copper', speed: '1G', uplink: true, status: 'active' } },
      { id: 'hs-e10', source: 'hs-b1-sw', target: 'hs-b1-ws1', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e11', source: 'hs-b1-sw', target: 'hs-b1-ws2', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e12', source: 'hs-b1-sw', target: 'hs-b1-prt', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'hs-e13', source: 'hs-b1-sw', target: 'hs-b1-ap', data: { mediaType: 'copper', speed: '1G', poe: true, status: 'active' } },
      // Branch 2 WAN link
      { id: 'hs-e14', source: 'hs-hq-fw', target: 'hs-b2-rtr', data: { mediaType: 'wan', speed: '1G', label: 'MPLS', protocol: 'MPLS', status: 'active' } },
      { id: 'hs-e15', source: 'hs-b2-rtr', target: 'hs-b2-sw', data: { mediaType: 'copper', speed: '1G', uplink: true, status: 'active' } },
      { id: 'hs-e16', source: 'hs-b2-sw', target: 'hs-b2-ws1', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e17', source: 'hs-b2-sw', target: 'hs-b2-ws2', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'hs-e18', source: 'hs-b2-sw', target: 'hs-b2-ap', data: { mediaType: 'copper', speed: '1G', poe: true, status: 'active' } },
      // Branch 3 WAN link
      { id: 'hs-e19', source: 'hs-hq-fw', target: 'hs-b3-rtr', data: { mediaType: 'wan', speed: '1G', label: 'MPLS', protocol: 'MPLS', status: 'active' } },
      { id: 'hs-e20', source: 'hs-b3-rtr', target: 'hs-b3-sw', data: { mediaType: 'copper', speed: '1G', uplink: true, status: 'active' } },
      { id: 'hs-e21', source: 'hs-b3-sw', target: 'hs-b3-ws', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      // VPN users
      { id: 'hs-e22', source: 'hs-vpn-ws1', target: 'hs-hq-fw', data: { mediaType: 'vpn', speed: 'variable', label: 'VPN/SSL', protocol: 'SSL-VPN', status: 'active' } },
      { id: 'hs-e23', source: 'hs-vpn-ws2', target: 'hs-hq-fw', data: { mediaType: 'vpn', speed: 'variable', label: 'VPN/SSL', protocol: 'SSL-VPN', status: 'active' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.7 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'hs-sim-1', name: 'Branch-1 WS can reach HQ File Server', type: 'reachability',
      sourceNodeId: 'hs-b1-ws1', targetNodeId: 'hs-hq-file', expectedResult: 'pass',
      description: 'Branch 1 workstation should reach HQ file server via MPLS WAN link',
    },
    {
      id: 'hs-sim-2', name: 'Branch-2 WS can reach HQ AD Server', type: 'reachability',
      sourceNodeId: 'hs-b2-ws1', targetNodeId: 'hs-hq-ad', expectedResult: 'pass',
      description: 'Branch 2 workstation should reach HQ Active Directory server',
    },
    {
      id: 'hs-sim-3', name: 'Remote VPN user can reach HQ App Server', type: 'reachability',
      sourceNodeId: 'hs-vpn-ws1', targetNodeId: 'hs-hq-app', expectedResult: 'pass',
      description: 'Remote VPN user should access HQ app server through VPN tunnel',
    },
    {
      id: 'hs-sim-4', name: 'Branch-1 cannot directly reach Branch-2', type: 'isolation',
      sourceNodeId: 'hs-b1-ws1', targetNodeId: 'hs-b2-ws1', expectedResult: 'pass',
      description: 'Branches should not be able to communicate directly (all traffic routes through HQ)',
    },
    {
      id: 'hs-sim-5', name: 'Branch-1 WS can reach internet', type: 'internet-access',
      sourceNodeId: 'hs-b1-ws1', targetNodeId: 'hs-internet', expectedResult: 'pass',
      description: 'Branch internet traffic should route through HQ firewall',
    },
  ],
}
