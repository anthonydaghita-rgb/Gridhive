import type { VendorDeviceProfile } from '../../types/vendors.js'

const baseServerSchema = {
  sections: [
    {
      id: 'device-settings',
      title: 'Device Settings',
      description: 'Basic device configuration for the access control server',
      fields: [
        {
          key: 'device_name',
          label: 'Device Name',
          type: 'text' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'ip_address',
          label: 'IP Address',
          type: 'ip' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'subnet_mask',
          label: 'Subnet Mask',
          type: 'text' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'controller_port',
          label: 'Controller Port',
          type: 'number' as const,
          defaultValue: 3001,
          required: false,
          affectsConfigOutput: true,
        },
      ],
    },
  ],
}

const baseControllerSchema = {
  sections: [
    {
      id: 'device-settings',
      title: 'Device Settings',
      description: 'Basic device configuration for the controller',
      fields: [
        {
          key: 'device_name',
          label: 'Device Name',
          type: 'text' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'ip_address',
          label: 'IP Address',
          type: 'ip' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'subnet_mask',
          label: 'Subnet Mask',
          type: 'text' as const,
          required: true,
          affectsConfigOutput: true,
        },
        {
          key: 'controller_port',
          label: 'Controller Port',
          type: 'number' as const,
          defaultValue: 3001,
          required: false,
          affectsConfigOutput: true,
        },
        {
          key: 'encryption_enabled',
          label: 'Encryption Enabled',
          type: 'boolean' as const,
          defaultValue: true,
          required: false,
          affectsConfigOutput: true,
        },
        {
          key: 'osdp_address',
          label: 'OSDP Address',
          type: 'number' as const,
          required: false,
          affectsConfigOutput: true,
        },
      ],
    },
  ],
}

export const honeywellAcDevices: VendorDeviceProfile[] = [
  {
    id: 'honeywell-proaccess-server',
    vendor: 'honeywell-ac',
    productLine: 'Honeywell Pro-Watch',
    model: 'Pro-Watch Server',
    displayName: 'Honeywell Pro-Watch Access Control Server',
    deviceType: 'ac-server',
    icon: 'ac-server',
    specs: {
      maxDoors: 64,
    },
    configSchema: baseServerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: 'Pro-Watch enterprise access control platform. Up to 64 readers per cluster. acPlatform: honeywell-pro-watch.',
  },
  {
    id: 'honeywell-winpak-server',
    vendor: 'honeywell-ac',
    productLine: 'Honeywell WIN-PAK',
    model: 'WIN-PAK Server',
    displayName: 'Honeywell WIN-PAK Access Control Server',
    deviceType: 'ac-server',
    icon: 'ac-server',
    specs: {
      maxDoors: 32,
    },
    configSchema: baseServerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: 'WIN-PAK access control platform. Up to 32 doors. SMB-oriented deployment. acPlatform: honeywell-win-pak.',
  },
  {
    id: 'honeywell-pas-4dl',
    vendor: 'honeywell-ac',
    productLine: 'Honeywell PAS',
    model: 'PAS-4DL',
    displayName: 'Honeywell PAS-4DL 4-Door Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 4,
    },
    configSchema: baseControllerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: '4-door PoE controller. OSDP v2 support. controllerProtocol: osdp.',
  },
]
