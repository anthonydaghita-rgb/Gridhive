import type { ReactNode } from 'react'
import type { DeviceType } from '@gridhive/shared'
import {
  FirewallIcon,
  FirewallEdgeIcon,
  SwitchL2Icon,
  SwitchL3Icon,
  RouterIcon,
  ServerIcon,
  WorkstationIcon,
  WirelessAPIcon,
  CameraIcon,
  VoIPPhoneIcon,
  PrinterIcon,
  NASIcon,
  InternetIcon,
  PLCIcon,
  SensorIcon,
  PatchPanelIcon,
  HMIIcon,
} from './DeviceIcons'
import { createElement } from 'react'

const DEVICE_ICON_MAP: Record<DeviceType, (props: { className?: string; size?: number }) => ReactNode> = {
  'firewall': FirewallIcon,
  'firewall-edge': FirewallEdgeIcon,
  'switch-l2': SwitchL2Icon,
  'switch-l3': SwitchL3Icon,
  'router': RouterIcon,
  'server': ServerIcon,
  'workstation': WorkstationIcon,
  'wireless-ap': WirelessAPIcon,
  'camera': CameraIcon,
  'voip-phone': VoIPPhoneIcon,
  'printer': PrinterIcon,
  'nas': NASIcon,
  'internet': InternetIcon,
  'plc': PLCIcon,
  'sensor': SensorIcon,
  'patch-panel': PatchPanelIcon,
  'hmi': HMIIcon,
}

export function getDeviceIcon(deviceType: DeviceType, props?: { className?: string; size?: number }): ReactNode {
  const Icon = DEVICE_ICON_MAP[deviceType] || ServerIcon
  return createElement(Icon as React.ComponentType<{ className?: string; size?: number }>, props)
}

export * from './DeviceIcons'
