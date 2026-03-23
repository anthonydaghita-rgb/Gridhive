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

export const ccureDevices: VendorDeviceProfile[] = [
  {
    id: 'ccure-9000-server',
    vendor: 'ccure',
    productLine: 'C-CURE 9000',
    model: '9000 Server',
    displayName: 'C-CURE 9000 Enterprise Access Control Server',
    deviceType: 'ac-server',
    icon: 'ac-server',
    specs: {},
    configSchema: baseServerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: 'Windows Server-based enterprise access control platform. Widely deployed in Fortune 500 environments. acPlatform: ccure-9000.',
  },
  {
    id: 'victor-apb-1502',
    vendor: 'ccure',
    productLine: 'Victor apC/8X',
    model: 'apC/8X-1502',
    displayName: 'Victor apC/8X 2-Door Legacy Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 2,
    },
    configSchema: baseControllerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2019,
    notes: '2-door apC/8X legacy access control panel. Mercury-based hardware. controllerProtocol: mercury.',
  },
]
