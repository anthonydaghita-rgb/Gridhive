export { hidGlobalDevices } from './hid-global.js'
export { lenelS2Devices } from './lenel-s2.js'
export { genetecDevices } from './genetec.js'
export { honeywellAcDevices } from './honeywell-ac.js'
export { brivoDevices } from './brivo.js'
export { axisAcDevices } from './axis-ac.js'
export { avigilonDevices } from './avigilon.js'
export { saltoDevices } from './salto.js'
export { kisiDevices } from './kisi.js'
export { ccureDevices } from './ccure.js'

import { hidGlobalDevices } from './hid-global.js'
import { lenelS2Devices } from './lenel-s2.js'
import { genetecDevices } from './genetec.js'
import { honeywellAcDevices } from './honeywell-ac.js'
import { brivoDevices } from './brivo.js'
import { axisAcDevices } from './axis-ac.js'
import { avigilonDevices } from './avigilon.js'
import { saltoDevices } from './salto.js'
import { kisiDevices } from './kisi.js'
import { ccureDevices } from './ccure.js'

export const ALL_AC_DEVICES = [
  ...hidGlobalDevices,
  ...lenelS2Devices,
  ...genetecDevices,
  ...honeywellAcDevices,
  ...brivoDevices,
  ...axisAcDevices,
  ...avigilonDevices,
  ...saltoDevices,
  ...kisiDevices,
  ...ccureDevices,
]
