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

export const brivoDevices: VendorDeviceProfile[] = [
  {
    id: 'brivo-acs300',
    vendor: 'brivo',
    productLine: 'Brivo ACS',
    model: 'ACS300',
    displayName: 'Brivo ACS300 2-Door Cloud Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 2,
      cloudManaged: true,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: '2-door cloud-managed IP controller. PoE powered. Managed via Brivo app. acPlatform: brivo. controllerProtocol: osdp.',
  },
  {
    id: 'brivo-acs6000',
    vendor: 'brivo',
    productLine: 'Brivo ACS',
    model: 'ACS6000',
    displayName: 'Brivo ACS6000 4-Door Cloud Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 4,
      cloudManaged: true,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2022,
    notes: '4-door cloud-managed IP controller. acPlatform: brivo. controllerProtocol: osdp.',
  },
]
