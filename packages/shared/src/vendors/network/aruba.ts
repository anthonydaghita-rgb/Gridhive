import type { VendorDeviceProfile } from '../../types/vendors.js'

export const arubaDevices: VendorDeviceProfile[] = [
  // --- SWITCHES ---
  {
    id: 'aruba-2930f-24g-4sfp',
    vendor: 'aruba-hpe',
    productLine: 'Aruba 2930F',
    model: '2930F 24G 4SFP',
    displayName: 'Aruba 2930F 24G 4SFP',
    deviceType: 'switch-l3',
    icon: 'aruba',
    releaseYear: 2019,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['WC.16.11.0015', 'WC.16.10.0022'],
    specs: {
      portCount: 24,
      sfpPorts: 4,
      layer3Capable: true,
      rackUnits: 1,
      formFactor: 'rack',
      managementProtocol: ['ssh', 'https', 'snmp'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'vlans',
          title: 'VLANs',
          description: 'VLAN and SVI configuration',
          fields: [
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: true, affectsConfigOutput: true },
            { key: 'vlan_name', label: 'VLAN Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'subnet', label: 'SVI Subnet (CIDR)', type: 'cidr', required: false, affectsConfigOutput: true },
          ],
        },
        {
          id: 'switch-ports',
          title: 'Switch Ports',
          description: 'Per-port VLAN configuration',
          fields: [
            { key: 'port_mode', label: 'Port Mode', type: 'select', required: false, affectsConfigOutput: true, options: [{ value: 'access', label: 'Access' }, { value: 'trunk', label: 'Trunk' }] },
            { key: 'port_vlan', label: 'Access VLAN', type: 'number', required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'AOS-S L3 switch, 24x GbE access ports.',
  },
  {
    id: 'aruba-2930f-48g-poe-4sfp',
    vendor: 'aruba-hpe',
    productLine: 'Aruba 2930F',
    model: '2930F 48G PoE+ 4SFP',
    displayName: 'Aruba 2930F 48G PoE+ 4SFP',
    deviceType: 'switch-l3',
    icon: 'aruba',
    releaseYear: 2019,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['WC.16.11.0015', 'WC.16.10.0022'],
    specs: {
      portCount: 48,
      poePorts: 48,
      poeWatts: 370,
      sfpPorts: 4,
      layer3Capable: true,
      rackUnits: 1,
      formFactor: 'rack',
      managementProtocol: ['ssh', 'https', 'snmp'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'vlans',
          title: 'VLANs',
          description: 'VLAN and SVI configuration',
          fields: [
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: true, affectsConfigOutput: true },
            { key: 'vlan_name', label: 'VLAN Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'subnet', label: 'SVI Subnet (CIDR)', type: 'cidr', required: false, affectsConfigOutput: true },
          ],
        },
        {
          id: 'switch-ports',
          title: 'Switch Ports',
          description: 'Per-port VLAN and PoE configuration',
          fields: [
            { key: 'port_mode', label: 'Port Mode', type: 'select', required: false, affectsConfigOutput: true, options: [{ value: 'access', label: 'Access' }, { value: 'trunk', label: 'Trunk' }] },
            { key: 'port_vlan', label: 'Access VLAN', type: 'number', required: false, affectsConfigOutput: true },
            { key: 'poe_enabled', label: 'PoE Enabled', type: 'boolean', defaultValue: true, required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'AOS-S L3 switch with 370W PoE budget.',
  },
  {
    id: 'aruba-6300m-24g-poe',
    vendor: 'aruba-hpe',
    productLine: 'Aruba 6300',
    model: '6300M 24G PoE',
    displayName: 'Aruba 6300M 24G PoE',
    deviceType: 'switch-l3',
    icon: 'aruba',
    releaseYear: 2021,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['10.13.1005', '10.12.0010'],
    specs: {
      portCount: 24,
      poePorts: 24,
      uplinkPorts: 4,
      layer3Capable: true,
      rackUnits: 1,
      formFactor: 'rack',
      managementProtocol: ['ssh', 'https', 'snmp', 'netconf'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'vlans',
          title: 'VLANs',
          description: 'VLAN and SVI configuration',
          fields: [
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: true, affectsConfigOutput: true },
            { key: 'vlan_name', label: 'VLAN Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'subnet', label: 'SVI Subnet (CIDR)', type: 'cidr', required: false, affectsConfigOutput: true },
          ],
        },
        {
          id: 'switch-ports',
          title: 'Switch Ports',
          description: 'Per-port VLAN and PoE configuration',
          fields: [
            { key: 'port_mode', label: 'Port Mode', type: 'select', required: false, affectsConfigOutput: true, options: [{ value: 'access', label: 'Access' }, { value: 'trunk', label: 'Trunk' }] },
            { key: 'port_vlan', label: 'Access VLAN', type: 'number', required: false, affectsConfigOutput: true },
            { key: 'poe_enabled', label: 'PoE Enabled', type: 'boolean', defaultValue: true, required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'AOS-CX advanced L3, 24x GbE PoE access with 4x SFP56 (50G) uplinks.',
  },
  {
    id: 'aruba-6405-switch',
    vendor: 'aruba-hpe',
    productLine: 'Aruba 6400',
    model: '6405 Switch',
    displayName: 'Aruba 6405 Modular Switch',
    deviceType: 'switch-l3',
    icon: 'aruba',
    releaseYear: 2021,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['10.13.1005', '10.12.0010'],
    specs: {
      layer3Capable: true,
      rackUnits: 7,
      formFactor: 'rack',
      managementProtocol: ['ssh', 'https', 'snmp', 'netconf'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'vlans',
          title: 'VLANs',
          description: 'VLAN and SVI configuration',
          fields: [
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: true, affectsConfigOutput: true },
            { key: 'vlan_name', label: 'VLAN Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'subnet', label: 'SVI Subnet (CIDR)', type: 'cidr', required: false, affectsConfigOutput: true },
          ],
        },
        {
          id: 'switch-ports',
          title: 'Switch Ports',
          description: 'Per-port configuration',
          fields: [
            { key: 'port_mode', label: 'Port Mode', type: 'select', required: false, affectsConfigOutput: true, options: [{ value: 'access', label: 'Access' }, { value: 'trunk', label: 'Trunk' }] },
            { key: 'port_vlan', label: 'Access VLAN', type: 'number', required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'Modular campus core chassis, supports up to 96x GbE or 48x 10G line cards.',
  },

  // --- ACCESS POINTS ---
  {
    id: 'aruba-ap-505',
    vendor: 'aruba-hpe',
    productLine: 'Aruba Access Points',
    model: 'AP-505',
    displayName: 'Aruba AP-505',
    deviceType: 'wireless-ap',
    icon: 'aruba',
    releaseYear: 2020,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['8.12.0.0', '8.11.2.0'],
    specs: {
      wirelessStandard: 'Wi-Fi 6 (802.11ax)',
      wirelessRadios: 2,
      formFactor: 'ceiling',
      managementProtocol: ['https'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'wireless',
          title: 'Wireless',
          description: 'Wireless network settings',
          fields: [
            { key: 'ssid_name', label: 'SSID Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'security', label: 'Security Mode', type: 'select', required: true, affectsConfigOutput: true, options: [{ value: 'wpa2', label: 'WPA2' }, { value: 'wpa3', label: 'WPA3' }, { value: 'open', label: 'Open' }] },
            { key: 'passphrase', label: 'Passphrase', type: 'password', required: false, affectsConfigOutput: true },
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'Indoor ceiling AP, Wi-Fi 6 dual-band, up to 1.5 Gbps.',
  },
  {
    id: 'aruba-ap-555',
    vendor: 'aruba-hpe',
    productLine: 'Aruba Access Points',
    model: 'AP-555',
    displayName: 'Aruba AP-555',
    deviceType: 'wireless-ap',
    icon: 'aruba',
    releaseYear: 2020,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['8.12.0.0', '8.11.2.0'],
    specs: {
      wirelessStandard: 'Wi-Fi 6 (802.11ax) tri-radio',
      wirelessRadios: 3,
      formFactor: 'ceiling',
      managementProtocol: ['https'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'wireless',
          title: 'Wireless',
          description: 'Wireless network settings',
          fields: [
            { key: 'ssid_name', label: 'SSID Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'security', label: 'Security Mode', type: 'select', required: true, affectsConfigOutput: true, options: [{ value: 'wpa2', label: 'WPA2' }, { value: 'wpa3', label: 'WPA3' }, { value: 'open', label: 'Open' }] },
            { key: 'passphrase', label: 'Passphrase', type: 'password', required: false, affectsConfigOutput: true },
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'High-density tri-radio Wi-Fi 6 AP, up to 2.4 Gbps.',
  },
  {
    id: 'aruba-ap-577',
    vendor: 'aruba-hpe',
    productLine: 'Aruba Access Points',
    model: 'AP-577',
    displayName: 'Aruba AP-577',
    deviceType: 'wireless-ap',
    icon: 'aruba',
    releaseYear: 2021,
    ndaaCompliant: true,
    configFormat: 'aruba-cli',
    firmwareVersions: ['8.12.0.0', '8.11.2.0'],
    specs: {
      wirelessStandard: 'Wi-Fi 6 (802.11ax)',
      wirelessRadios: 2,
      formFactor: 'outdoor',
      managementProtocol: ['https'],
    },
    configSchema: {
      sections: [
        {
          id: 'system',
          title: 'System',
          description: 'Basic device identity settings',
          fields: [
            { key: 'hostname', label: 'Hostname', type: 'text', required: true, affectsConfigOutput: true },
          ],
        },
        {
          id: 'wireless',
          title: 'Wireless',
          description: 'Wireless network settings',
          fields: [
            { key: 'ssid_name', label: 'SSID Name', type: 'text', required: true, affectsConfigOutput: true },
            { key: 'security', label: 'Security Mode', type: 'select', required: true, affectsConfigOutput: true, options: [{ value: 'wpa2', label: 'WPA2' }, { value: 'wpa3', label: 'WPA3' }, { value: 'open', label: 'Open' }] },
            { key: 'passphrase', label: 'Passphrase', type: 'password', required: false, affectsConfigOutput: true },
            { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: false, affectsConfigOutput: true },
          ],
        },
      ],
    },
    notes: 'Outdoor IP67 Wi-Fi 6 access point.',
  },
]
