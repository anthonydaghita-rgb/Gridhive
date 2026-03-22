import type { NetForgeTemplate } from '../../types/index.js'

export const hybridEnterpriseTemplate: NetForgeTemplate = {
  id: 'tmpl-hybrid-enterprise-001',
  slug: 'hybrid-enterprise',
  version: '1.0.0',
  isSystem: true,
  orgId: null,
  createdBy: null,
  meta: {
    name: 'Hybrid Enterprise - Cloud & On-Premises',
    category: 'hybrid-cloud',
    description: 'Hybrid enterprise topology combining on-premises infrastructure with cloud services and secure connectivity.',
    tags: ['hybrid-cloud', 'enterprise', 'cloud', 'vpn', 'dmz', 'on-premises'],
    difficulty: 'advanced',
    deviceCount: 25,
    thumbnail: '',
    notes: 'Modern enterprise design bridging on-premises data centers with cloud infrastructure.',
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
