import type { NetForgeTemplate } from '../../types/index.js'

export const linearFieldbusTemplate: NetForgeTemplate = {
  id: 'tmpl-linear-fieldbus-001',
  slug: 'linear-fieldbus',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Linear Topology - Fieldbus Network',
    category: 'industrial',
    description: 'Linear fieldbus topology for sequential industrial process control with daisy-chained sensors.',
    tags: ['industrial', 'fieldbus', 'sensors', 'linear', 'process-control'],
    difficulty: 'beginner',
    deviceCount: 8,
    thumbnail: '',
    notes: 'Simple linear layout for process automation and fieldbus communication.',
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
