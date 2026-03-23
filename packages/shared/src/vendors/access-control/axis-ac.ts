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

const baseIntercomSchema = {
  sections: [
    {
      id: 'device-settings',
      title: 'Device Settings',
      description: 'Basic device configuration for the intercom',
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

export const axisAcDevices: VendorDeviceProfile[] = [
  {
    id: 'axis-a1001',
    vendor: 'axis',
    productLine: 'AXIS A1001',
    model: 'A1001',
    displayName: 'AXIS A1001 1-Door Network Door Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 1,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: '1-door IP controller. OSDP v2 and Wiegand reader support. PoE powered. Integrates with AXIS Camera Station. controllerProtocol: osdp.',
  },
  {
    id: 'axis-a1601',
    vendor: 'axis',
    productLine: 'AXIS A1601',
    model: 'A1601',
    displayName: 'AXIS A1601 2-Door Network Door Controller',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 2,
    },
    configSchema: baseControllerSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2022,
    notes: '2-door IP controller. OSDP v2 support. PoE powered. controllerProtocol: osdp.',
  },
  {
    id: 'axis-a8207-ve',
    vendor: 'axis',
    productLine: 'AXIS A8207',
    model: 'A8207-VE',
    displayName: 'AXIS A8207-VE IP Video Door Station',
    deviceType: 'ac-intercom',
    icon: 'ac-intercom',
    specs: {},
    configSchema: baseIntercomSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: 'IP video door station combining intercom, card reader, and camera in a single unit.',
  },
  {
    id: 'axis-a8105-e',
    vendor: 'axis',
    productLine: 'AXIS A8105',
    model: 'A8105-E',
    displayName: 'AXIS A8105-E Network Video Door Station',
    deviceType: 'ac-intercom',
    icon: 'ac-intercom',
    specs: {
      formFactor: 'outdoor',
    },
    configSchema: baseIntercomSchema,
    configFormat: 'generic-summary',
    firmwareVersions: ['latest'],
    releaseYear: 2020,
    notes: 'Outdoor IP65-rated network video door station.',
  },
]
