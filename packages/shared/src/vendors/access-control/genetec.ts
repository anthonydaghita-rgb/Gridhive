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

export const genetecDevices: VendorDeviceProfile[] = [
  {
    id: 'genetec-security-center',
    vendor: 'genetec',
    productLine: 'Genetec Security Center',
    model: 'Security Center',
    displayName: 'Genetec Security Center Unified Platform',
    deviceType: 'ac-server',
    icon: 'ac-server',
    specs: {
      maxDoors: 100000,
    },
    configSchema: baseServerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: 'Unified Synergis access control and Omnicast video management platform. Supports 10 to 100k doors. acPlatform: genetec-security-center.',
  },
  {
    id: 'genetec-synergis-cloud-link',
    vendor: 'genetec',
    productLine: 'Genetec Synergis',
    model: 'Synergis Cloud Link',
    displayName: 'Genetec Synergis Cloud Link Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 64,
      formFactor: 'din-rail',
    },
    configSchema: baseControllerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2022,
    notes: 'Supports up to 8 Mercury panels (8 doors each = 64 doors total). PoE powered. DIN-rail or wall mount. Acts as bridge between Mercury hardware and Security Center. controllerProtocol: mercury.',
  },
]
