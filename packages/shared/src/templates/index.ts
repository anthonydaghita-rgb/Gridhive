export { starOfficeTemplate } from './system/star-office.js'
export { meshIotTemplate } from './system/mesh-iot.js'
export { ringIndustrialTemplate } from './system/ring-industrial.js'
export { linearFieldbusTemplate } from './system/linear-fieldbus.js'
export { hubSpokeBranchTemplate } from './system/hub-spoke-branch.js'
export { treeCampusTemplate } from './system/tree-campus.js'
export { hybridEnterpriseTemplate } from './system/hybrid-enterprise.js'

import { starOfficeTemplate } from './system/star-office.js'
import { meshIotTemplate } from './system/mesh-iot.js'
import { ringIndustrialTemplate } from './system/ring-industrial.js'
import { linearFieldbusTemplate } from './system/linear-fieldbus.js'
import { hubSpokeBranchTemplate } from './system/hub-spoke-branch.js'
import { treeCampusTemplate } from './system/tree-campus.js'
import { hybridEnterpriseTemplate } from './system/hybrid-enterprise.js'
import type { NetForgeTemplate } from './types.js'

export const SYSTEM_TEMPLATES: NetForgeTemplate[] = [
  starOfficeTemplate,
  meshIotTemplate,
  ringIndustrialTemplate,
  linearFieldbusTemplate,
  hubSpokeBranchTemplate,
  treeCampusTemplate,
  hybridEnterpriseTemplate,
]
