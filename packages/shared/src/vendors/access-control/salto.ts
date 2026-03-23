import type { VendorDeviceProfile } from '../../types/vendors.js'

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

const baseReaderSchema = {
  sections: [
    {
      id: 'device-settings',
      title: 'Device Settings',
      description: 'Basic device configuration for the reader',
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
          required: false,
          affectsConfigOutput: true,
        },
        {
          key: 'subnet_mask',
          label: 'Subnet Mask',
          type: 'text' as const,
          required: false,
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

export const saltoDevices: VendorDeviceProfile[] = [
  {
    id: 'salto-ku-controller',
    vendor: 'salto',
    productLine: 'SALTO KS',
    model: 'KS Controller',
    displayName: 'SALTO KS Cloud Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      cloudManaged: true,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: 'SALTO KS cloud-managed controller for wireless lock network. acPlatform: salto-pro-access. cloudManaged: true.',
  },
  {
    id: 'salto-xs4-reader',
    vendor: 'salto',
    productLine: 'SALTO XS4',
    model: 'XS4 Reader',
    displayName: 'SALTO XS4 RFID Reader',
    deviceType: 'ac-reader',
    icon: 'ac-reader',
    specs: {},
    configSchema: baseReaderSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: 'RFID reader with OSDP support. MIFARE DESFire credential technology. credentialTypes: smart-card, mobile-nfc. readerProtocol: osdp.',
  },
]
