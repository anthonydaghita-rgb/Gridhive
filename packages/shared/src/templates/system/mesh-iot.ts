import type { NetForgeTemplate } from '../../types/index.js'

export const meshIotTemplate: NetForgeTemplate = {
  id: 'tmpl-mesh-iot-001',
  slug: 'mesh-iot',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Mesh Topology - IoT Network',
    category: 'iot',
    description: 'Mesh IoT network topology with redundant paths, sensor nodes, and centralized management.',
    tags: ['iot', 'mesh', 'sensors', 'redundancy'],
    difficulty: 'advanced',
    deviceCount: 20,
    thumbnail: '',
    notes: 'Suitable for large-scale IoT deployments requiring high availability.',
    validationExpected: 'pass',
  },
  topology: {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
  },
  simTestSuite: [],
}
