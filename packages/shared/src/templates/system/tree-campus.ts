import type { NetForgeTemplate } from '../../types/index.js'

export const treeCampusTemplate: NetForgeTemplate = {
  id: 'tmpl-tree-campus-001',
  slug: 'tree-campus',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Tree Topology - Campus Enterprise Network',
    category: 'campus-enterprise',
    description: 'Hierarchical tree topology for large campus enterprise networks with core, distribution, and access layers.',
    tags: ['campus', 'enterprise', 'hierarchical', 'core-distribution-access', 'vlan'],
    difficulty: 'advanced',
    deviceCount: 30,
    thumbnail: '',
    notes: 'Three-layer hierarchical design suitable for university or corporate campus environments.',
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
