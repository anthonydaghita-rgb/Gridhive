import type { NetForgeTemplate } from '../../types/index.js'

export const ringIndustrialTemplate: NetForgeTemplate = {
  id: 'tmpl-ring-industrial-001',
  slug: 'ring-industrial',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Ring Topology - Industrial Network',
    category: 'industrial',
    description: 'Industrial ring topology with PLC controllers, HMI systems, and fault-tolerant redundancy.',
    tags: ['industrial', 'ring', 'plc', 'hmi', 'ot'],
    difficulty: 'intermediate',
    deviceCount: 12,
    thumbnail: '',
    notes: 'Designed for industrial environments with ring redundancy protocols.',
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
