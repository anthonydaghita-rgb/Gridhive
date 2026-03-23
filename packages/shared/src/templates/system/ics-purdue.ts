import type { NetForgeTemplate } from '../../types/index.js'

export const icsPurdueTemplate: NetForgeTemplate = {
  id: 'tmpl-ics-purdue-001',
  slug: 'ics-purdue',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'ICS Network — Purdue Model (ISA-99)',
    category: 'industrial',
    description:
      'Industrial Control System network following the Purdue Model / ISA-99 reference architecture. Four security zones (Enterprise, DMZ, Control, Field) separated by firewalls. SCADA, PLCs, HMIs, and sensors are fully segmented from corporate IT.',
    tags: ['industrial', 'ics', 'scada', 'purdue-model', 'isa-99', 'plc', 'hmi', 'dmz', 'segmentation', 'ot'],
    difficulty: 'advanced',
    deviceCount: 21,
    thumbnail: '',
    notes:
      'Purdue Model zones — Enterprise: 192.168.10.0/24 | DMZ: 192.168.20.0/24 | Control (L2): 10.100.2.0/24 | Field (L1/L0): 10.100.1.0/24. Two firewalls enforce strict zone isolation. Data flows upward through historian replication; control commands flow downward only.',
    validationExpected: 'warnings',
  },
  topology: {
    nodes: [
      // ── Enterprise Zone (Level 4) ──────────────────────────────────────────
      {
        id: 'ics-ent-sw', type: 'switch-l3', position: { x: 420, y: 60 }, data: {
          hostname: 'ENT-SW-01', label: 'Enterprise Switch', deviceType: 'switch-l3',
          ipAddress: '192.168.10.1/24', subnet: '192.168.10.0/24',
          manufacturer: 'Cisco', model: 'Catalyst 9300',
          vlans: [{ id: 10, name: 'CORPORATE' }, { id: 200, name: 'MGMT' }],
        },
      },
      {
        id: 'ics-erp', type: 'server', position: { x: 200, y: 160 }, data: {
          hostname: 'ERP-SRV-01', label: 'ERP Server', deviceType: 'server',
          ipAddress: '192.168.10.10/24', subnet: '192.168.10.0/24',
          defaultGateway: '192.168.10.1', os: 'Windows Server 2022',
          role: 'erp', manufacturer: 'Dell',
        },
      },
      {
        id: 'ics-op-ws', type: 'workstation', position: { x: 640, y: 160 }, data: {
          hostname: 'OPS-WS-01', label: 'Operations Workstation', deviceType: 'workstation',
          ipAddress: '192.168.10.20/24', subnet: '192.168.10.0/24',
          defaultGateway: '192.168.10.1', os: 'Windows 11',
          role: 'operations-workstation',
        },
      },

      // ── ICS Perimeter Firewall (Enterprise ↔ DMZ) ─────────────────────────
      {
        id: 'ics-fw1', type: 'firewall', position: { x: 420, y: 260 }, data: {
          hostname: 'FW-ICS-PERIMETER', label: 'ICS Perimeter Firewall', deviceType: 'firewall',
          ipAddress: '192.168.10.254/24', subnet: '192.168.10.0/24',
          manufacturer: 'Palo Alto Networks', model: 'PA-850',
          role: 'perimeter-firewall',
          notes: 'Separates Enterprise (L4) from ICS DMZ. Only historian replication and jump-host sessions permitted inbound to DMZ.',
        },
      },

      // ── ICS DMZ ───────────────────────────────────────────────────────────
      {
        id: 'ics-dmz-sw', type: 'switch-l2', position: { x: 420, y: 380 }, data: {
          hostname: 'DMZ-SW-01', label: 'DMZ Switch', deviceType: 'switch-l2',
          ipAddress: '192.168.20.1/24', subnet: '192.168.20.0/24',
          manufacturer: 'Hirschmann', model: 'MACH104',
        },
      },
      {
        id: 'ics-hist-mir', type: 'server', position: { x: 220, y: 480 }, data: {
          hostname: 'HIST-MIR-01', label: 'Historian Mirror', deviceType: 'server',
          ipAddress: '192.168.20.10/24', subnet: '192.168.20.0/24',
          defaultGateway: '192.168.20.1', os: 'Windows Server 2022',
          role: 'historian-mirror',
          notes: 'Read-only replica of OT historian. Accessible from enterprise for reporting.',
        },
      },
      {
        id: 'ics-jump', type: 'server', position: { x: 620, y: 480 }, data: {
          hostname: 'JUMP-SRV-01', label: 'Jump Host', deviceType: 'server',
          ipAddress: '192.168.20.11/24', subnet: '192.168.20.0/24',
          defaultGateway: '192.168.20.1', os: 'Windows Server 2022',
          role: 'jump-host',
          notes: 'Bastion / jump server. Only authorised admins may use this to access the control zone.',
        },
      },

      // ── ICS Control Firewall (DMZ ↔ Control Zone) ─────────────────────────
      {
        id: 'ics-fw2', type: 'firewall', position: { x: 420, y: 580 }, data: {
          hostname: 'FW-ICS-CONTROL', label: 'ICS Control Firewall', deviceType: 'firewall',
          ipAddress: '192.168.20.254/24', subnet: '192.168.20.0/24',
          manufacturer: 'Fortinet', model: 'FortiGate 100F',
          role: 'control-firewall',
          notes: 'Separates DMZ from OT Control Zone (L2). Blocks all unsolicited inbound traffic. Historian push and jump-host sessions only.',
        },
      },

      // ── Control Zone (Level 2) ─────────────────────────────────────────────
      {
        id: 'ics-ctrl-sw', type: 'switch-l2', position: { x: 420, y: 700 }, data: {
          hostname: 'CTRL-SW-01', label: 'Control Network Switch', deviceType: 'switch-l2',
          ipAddress: '10.100.2.1/24', subnet: '10.100.2.0/24',
          manufacturer: 'Rockwell Automation', model: 'Stratix 5700',
        },
      },
      {
        id: 'ics-scada', type: 'server', position: { x: 100, y: 800 }, data: {
          hostname: 'SCADA-SRV-01', label: 'SCADA Server', deviceType: 'server',
          ipAddress: '10.100.2.10/24', subnet: '10.100.2.0/24',
          defaultGateway: '10.100.2.1', os: 'Windows Server 2019',
          role: 'scada-server', manufacturer: 'Wonderware',
        },
      },
      {
        id: 'ics-eng-ws', type: 'workstation', position: { x: 300, y: 800 }, data: {
          hostname: 'ENG-WS-01', label: 'Engineering Workstation', deviceType: 'workstation',
          ipAddress: '10.100.2.11/24', subnet: '10.100.2.0/24',
          defaultGateway: '10.100.2.1', os: 'Windows 10',
          role: 'engineering-workstation',
          notes: 'Used for PLC programming, HMI configuration, and network diagnostics.',
        },
      },
      {
        id: 'ics-hist', type: 'server', position: { x: 540, y: 800 }, data: {
          hostname: 'HIST-SRV-01', label: 'OT Historian', deviceType: 'server',
          ipAddress: '10.100.2.12/24', subnet: '10.100.2.0/24',
          defaultGateway: '10.100.2.1', os: 'Windows Server 2022',
          role: 'historian', manufacturer: 'OSIsoft',
          notes: 'Primary OT historian. Replicates data to DMZ historian mirror (one-way push).',
        },
      },
      {
        id: 'ics-hmi1', type: 'hmi', position: { x: 160, y: 900 }, data: {
          hostname: 'HMI-01', label: 'HMI Station 1', deviceType: 'hmi',
          ipAddress: '10.100.2.20/24', subnet: '10.100.2.0/24',
          defaultGateway: '10.100.2.1', manufacturer: 'Siemens', model: 'SIMATIC HMI TP1900',
        },
      },
      {
        id: 'ics-hmi2', type: 'hmi', position: { x: 680, y: 900 }, data: {
          hostname: 'HMI-02', label: 'HMI Station 2', deviceType: 'hmi',
          ipAddress: '10.100.2.21/24', subnet: '10.100.2.0/24',
          defaultGateway: '10.100.2.1', manufacturer: 'Siemens', model: 'SIMATIC HMI TP900',
        },
      },

      // ── Field Zone (Level 1 / Level 0) ────────────────────────────────────
      {
        id: 'ics-field-sw', type: 'switch-l2', position: { x: 420, y: 1000 }, data: {
          hostname: 'FIELD-SW-01', label: 'Field Bus Switch', deviceType: 'switch-l2',
          ipAddress: '10.100.1.1/24', subnet: '10.100.1.0/24',
          manufacturer: 'Phoenix Contact', model: 'FL SWITCH 2008',
        },
      },
      {
        id: 'ics-plc1', type: 'plc', position: { x: 240, y: 1100 }, data: {
          hostname: 'PLC-01', label: 'PLC 1 — Line A', deviceType: 'plc',
          ipAddress: '10.100.1.10/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', manufacturer: 'Siemens', model: 'S7-1500',
          role: 'line-controller',
          notes: 'Controls production Line A. Communicates with sensors via PROFINET.',
        },
      },
      {
        id: 'ics-plc2', type: 'plc', position: { x: 600, y: 1100 }, data: {
          hostname: 'PLC-02', label: 'PLC 2 — Line B', deviceType: 'plc',
          ipAddress: '10.100.1.11/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', manufacturer: 'Allen-Bradley', model: 'ControlLogix 5580',
          role: 'line-controller',
          notes: 'Controls production Line B. Communicates with sensors via EtherNet/IP.',
        },
      },
      {
        id: 'ics-sensor1', type: 'sensor', position: { x: 100, y: 1200 }, data: {
          hostname: 'SENS-01', label: 'Pressure Sensor 1', deviceType: 'sensor',
          ipAddress: '10.100.1.20/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', role: 'pressure-sensor',
        },
      },
      {
        id: 'ics-sensor2', type: 'sensor', position: { x: 320, y: 1200 }, data: {
          hostname: 'SENS-02', label: 'Temperature Sensor 1', deviceType: 'sensor',
          ipAddress: '10.100.1.21/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', role: 'temperature-sensor',
        },
      },
      {
        id: 'ics-sensor3', type: 'sensor', position: { x: 520, y: 1200 }, data: {
          hostname: 'SENS-03', label: 'Flow Sensor 1', deviceType: 'sensor',
          ipAddress: '10.100.1.22/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', role: 'flow-sensor',
        },
      },
      {
        id: 'ics-sensor4', type: 'sensor', position: { x: 740, y: 1200 }, data: {
          hostname: 'SENS-04', label: 'Vibration Sensor 1', deviceType: 'sensor',
          ipAddress: '10.100.1.23/24', subnet: '10.100.1.0/24',
          defaultGateway: '10.100.1.1', role: 'vibration-sensor',
        },
      },
    ],
    edges: [
      // Enterprise zone internal
      { id: 'ics-e1', source: 'ics-ent-sw', target: 'ics-erp', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ics-e2', source: 'ics-ent-sw', target: 'ics-op-ws', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      // Enterprise → Perimeter FW
      { id: 'ics-e3', source: 'ics-ent-sw', target: 'ics-fw1', data: { mediaType: 'fiber', speed: '10G', status: 'active', label: 'L4 → DMZ' } },
      // Perimeter FW → DMZ switch
      { id: 'ics-e4', source: 'ics-fw1', target: 'ics-dmz-sw', data: { mediaType: 'fiber', speed: '10G', status: 'active' } },
      // DMZ internal
      { id: 'ics-e5', source: 'ics-dmz-sw', target: 'ics-hist-mir', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ics-e6', source: 'ics-dmz-sw', target: 'ics-jump', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      // DMZ → Control FW
      { id: 'ics-e7', source: 'ics-dmz-sw', target: 'ics-fw2', data: { mediaType: 'fiber', speed: '1G', status: 'active', label: 'DMZ → L2' } },
      // Control FW → Control switch
      { id: 'ics-e8', source: 'ics-fw2', target: 'ics-ctrl-sw', data: { mediaType: 'fiber', speed: '1G', status: 'active' } },
      // Control zone internal
      { id: 'ics-e9', source: 'ics-ctrl-sw', target: 'ics-scada', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ics-e10', source: 'ics-ctrl-sw', target: 'ics-eng-ws', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ics-e11', source: 'ics-ctrl-sw', target: 'ics-hist', data: { mediaType: 'copper', speed: '1G', status: 'active' } },
      { id: 'ics-e12', source: 'ics-ctrl-sw', target: 'ics-hmi1', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      { id: 'ics-e13', source: 'ics-ctrl-sw', target: 'ics-hmi2', data: { mediaType: 'copper', speed: '100M', status: 'active' } },
      // Control zone → Field switch
      { id: 'ics-e14', source: 'ics-ctrl-sw', target: 'ics-field-sw', data: { mediaType: 'fiber', speed: '1G', status: 'active', label: 'L2 → L1/L0', protocol: 'PROFINET' } },
      // Field zone: switches → PLCs
      { id: 'ics-e15', source: 'ics-field-sw', target: 'ics-plc1', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      { id: 'ics-e16', source: 'ics-field-sw', target: 'ics-plc2', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'EtherNet/IP' } },
      // PLCs → Sensors
      { id: 'ics-e17', source: 'ics-plc1', target: 'ics-sensor1', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      { id: 'ics-e18', source: 'ics-plc1', target: 'ics-sensor2', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'PROFINET' } },
      { id: 'ics-e19', source: 'ics-plc2', target: 'ics-sensor3', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'EtherNet/IP' } },
      { id: 'ics-e20', source: 'ics-plc2', target: 'ics-sensor4', data: { mediaType: 'copper', speed: '100M', status: 'active', protocol: 'EtherNet/IP' } },
    ],
    viewport: { x: 0, y: 0, zoom: 0.7 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [
    {
      id: 'ics-sim-1', name: 'SCADA can reach PLC-1', type: 'reachability',
      sourceNodeId: 'ics-scada', targetNodeId: 'ics-plc1', expectedResult: 'pass',
      description: 'SCADA server must be able to poll PLCs in the field zone via the control switch',
    },
    {
      id: 'ics-sim-2', name: 'Enterprise cannot reach Control Zone directly', type: 'isolation',
      sourceNodeId: 'ics-erp', targetNodeId: 'ics-scada', expectedResult: 'fail',
      description: 'Enterprise hosts must not have direct access to the OT control zone — two firewalls enforce this',
    },
    {
      id: 'ics-sim-3', name: 'Jump Host can reach Engineering Workstation', type: 'reachability',
      sourceNodeId: 'ics-jump', targetNodeId: 'ics-eng-ws', expectedResult: 'pass',
      description: 'Authorised admins access OT engineering workstation only via the DMZ jump host',
    },
    {
      id: 'ics-sim-4', name: 'Historian can reach Historian Mirror (one-way push)', type: 'reachability',
      sourceNodeId: 'ics-hist', targetNodeId: 'ics-hist-mir', expectedResult: 'pass',
      description: 'OT historian pushes data upward to DMZ mirror for enterprise reporting — flow must be outbound only',
    },
    {
      id: 'ics-sim-5', name: 'Sensors cannot reach SCADA directly', type: 'isolation',
      sourceNodeId: 'ics-sensor1', targetNodeId: 'ics-scada', expectedResult: 'fail',
      description: 'Field sensors communicate only with their PLCs; direct SCADA access from the field is not permitted',
    },
    {
      id: 'ics-sim-6', name: 'HMI can reach PLC-1', type: 'reachability',
      sourceNodeId: 'ics-hmi1', targetNodeId: 'ics-plc1', expectedResult: 'pass',
      description: 'HMI operators need to monitor and control PLCs in the field zone',
    },
  ],
}
