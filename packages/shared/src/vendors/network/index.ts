export { ubiquitiDevices } from './ubiquiti.js'
export { merakiDevices } from './cisco-meraki.js'
export { fortinetDevices } from './fortinet.js'
export { ciscoIosDevices } from './cisco-ios.js'
export { paloAltoDevices } from './palo-alto.js'
export { sonicwallDevices } from './sonicwall.js'
export { watchguardDevices } from './watchguard.js'
export { arubaDevices } from './aruba.js'

import { ubiquitiDevices } from './ubiquiti.js'
import { merakiDevices } from './cisco-meraki.js'
import { fortinetDevices } from './fortinet.js'
import { ciscoIosDevices } from './cisco-ios.js'
import { paloAltoDevices } from './palo-alto.js'
import { sonicwallDevices } from './sonicwall.js'
import { watchguardDevices } from './watchguard.js'
import { arubaDevices } from './aruba.js'

export const ALL_NETWORK_DEVICES = [
  ...ubiquitiDevices,
  ...merakiDevices,
  ...fortinetDevices,
  ...ciscoIosDevices,
  ...paloAltoDevices,
  ...sonicwallDevices,
  ...watchguardDevices,
  ...arubaDevices,
]
