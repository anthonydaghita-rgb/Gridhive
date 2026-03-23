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

export const avigilonDevices: VendorDeviceProfile[] = [
  {
    id: 'avigilon-acc7-server',
    vendor: 'avigilon',
    productLine: 'Avigilon ACC',
    model: 'ACC7 Server',
    displayName: 'Avigilon ACC7 Unified Video and Access Control Server',
    deviceType: 'ac-server',
    icon: 'ac-server',
    specs: {},
    configSchema: baseServerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: 'Unified ACC video surveillance and ACM access control platform. Uses Mercury hardware panels. acPlatform: avigilon-acc.',
  },
  {
    id: 'avigilon-acm-panel-4d',
    vendor: 'avigilon',
    productLine: 'Avigilon ACM',
    model: 'ACM Panel 4D',
    displayName: 'Avigilon ACM 4-Door Access Control Panel',
    deviceType: 'ac-controller',
    icon: 'ac-controller',
    specs: {
      maxDoors: 4,
    },
    configSchema: baseControllerSchema,
    configFormat: 'ac-implementation-guide',
    firmwareVersions: ['latest'],
    releaseYear: 2021,
    notes: '4-door ACM access control panel. Mercury-based hardware. IP connected. OSDP reader support. controllerProtocol: osdp.',
  },
]
