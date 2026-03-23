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

export const kisiDevices: VendorDeviceProfile[] = [
  {
    id: 'kisi-controller-pro',
    vendor: 'kisi',
    productLine: 'Kisi Controller',
    model: 'Controller Pro',
    displayName: 'Kisi Controller Pro 1-Door Cloud Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 1,
      cloudManaged: true,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2022,
    notes: '1-door IP cloud controller. PoE powered. BLE and NFC credential support. acPlatform: kisi. cloudManaged: true. controllerProtocol: osdp.',
  },
]
