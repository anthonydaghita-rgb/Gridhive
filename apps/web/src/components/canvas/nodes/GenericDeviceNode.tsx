import type { NodeProps } from '@xyflow/react'
import type { DeviceData, DeviceType } from '@gridhive/shared'
import { BaseNode } from './BaseNode'
import { getDeviceIcon } from '../../../lib/icons'

type StyleEntry = { bg: string; border: string; text: string }

const DEVICE_COLORS: Partial<Record<DeviceType, StyleEntry>> = {
  // Network Infrastructure
  'load-balancer':        { bg: 'bg-orange-900/50', border: 'border-orange-800', text: 'text-orange-300' },
  'wan-optimizer':        { bg: 'bg-orange-900/50', border: 'border-orange-800', text: 'text-orange-300' },
  'content-filter':       { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  'ddos-scrubber':        { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  'dns-server':           { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'radius-server':        { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'proxy-server':         { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'siem-server':          { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  'log-server':           { bg: 'bg-gray-800/80',   border: 'border-gray-600',   text: 'text-gray-300' },
  'network-tap':          { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'packet-broker':        { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  // Wireless and Cellular
  'wireless-controller':  { bg: 'bg-cyan-900/50',   border: 'border-cyan-800',   text: 'text-cyan-300' },
  'cellular-gateway':     { bg: 'bg-cyan-900/50',   border: 'border-cyan-800',   text: 'text-cyan-300' },
  'cellular-modem':       { bg: 'bg-cyan-900/50',   border: 'border-cyan-800',   text: 'text-cyan-300' },
  'satellite-modem':      { bg: 'bg-sky-900/50',    border: 'border-sky-800',    text: 'text-sky-300' },
  'lte-router':           { bg: 'bg-cyan-900/50',   border: 'border-cyan-800',   text: 'text-cyan-300' },
  'sd-wan-appliance':     { bg: 'bg-orange-900/50', border: 'border-orange-800', text: 'text-orange-300' },
  // Compute and Virtualization
  'hypervisor':           { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'virtual-machine':      { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'container-host':       { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'blade-chassis':        { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'blade-server':         { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'server-rack':          { bg: 'bg-gray-800/80',   border: 'border-gray-600',   text: 'text-gray-300' },
  'thin-client':          { bg: 'bg-gray-800/80',   border: 'border-gray-600',   text: 'text-gray-300' },
  'gpu-server':           { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  // Storage
  'san-switch':           { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'tape-library':         { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'backup-appliance':     { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  'object-storage':       { bg: 'bg-violet-900/50', border: 'border-violet-800', text: 'text-violet-300' },
  // Power and Environmental
  'ups':                  { bg: 'bg-yellow-900/50', border: 'border-yellow-800', text: 'text-yellow-300' },
  'pdu':                  { bg: 'bg-yellow-900/50', border: 'border-yellow-800', text: 'text-yellow-300' },
  'environmental-sensor': { bg: 'bg-yellow-900/50', border: 'border-yellow-800', text: 'text-yellow-300' },
  'generator':            { bg: 'bg-yellow-900/50', border: 'border-yellow-800', text: 'text-yellow-300' },
  'cooling-unit':         { bg: 'bg-cyan-900/50',   border: 'border-cyan-800',   text: 'text-cyan-300' },
  // Unified Communications
  'pbx-server':           { bg: 'bg-indigo-900/50', border: 'border-indigo-800', text: 'text-indigo-300' },
  'sbc':                  { bg: 'bg-indigo-900/50', border: 'border-indigo-800', text: 'text-indigo-300' },
  'voip-gateway':         { bg: 'bg-indigo-900/50', border: 'border-indigo-800', text: 'text-indigo-300' },
  'video-conference-unit':{ bg: 'bg-indigo-900/50', border: 'border-indigo-800', text: 'text-indigo-300' },
  // Industrial OT
  'rtu':                  { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'dcs':                  { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'sis-controller':       { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'historian-server':     { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'scada-server':         { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'ied':                  { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'protocol-converter':   { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'data-diode':           { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  // Physical Security additions
  'nvr':                  { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'dvr':                  { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'video-analytics-server':{ bg: 'bg-slate-800/80', border: 'border-slate-700',  text: 'text-slate-300' },
  'license-plate-reader': { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'intrusion-panel':      { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  'fire-panel-gateway':   { bg: 'bg-red-900/50',    border: 'border-red-800',    text: 'text-red-300' },
  // Smart Building
  'bas-controller':       { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  'hvac-controller':      { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  'lighting-controller':  { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  'energy-meter':         { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  'bacnet-router':        { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  'elevator-controller':  { bg: 'bg-teal-900/50',   border: 'border-teal-800',   text: 'text-teal-300' },
  // Healthcare
  'medical-device':       { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  'infusion-pump':        { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  'patient-monitor':      { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  'emr-server':           { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  'pacs-server':          { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  'nurse-call-server':    { bg: 'bg-pink-900/50',   border: 'border-pink-800',   text: 'text-pink-300' },
  // Cloud and Internet
  'cloud-aws':            { bg: 'bg-amber-900/50',  border: 'border-amber-800',  text: 'text-amber-300' },
  'cloud-azure':          { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'cloud-gcp':            { bg: 'bg-green-900/50',  border: 'border-green-800',  text: 'text-green-300' },
  'cloud-m365':           { bg: 'bg-blue-900/50',   border: 'border-blue-800',   text: 'text-blue-300' },
  'cloud-saas':           { bg: 'bg-sky-900/50',    border: 'border-sky-800',    text: 'text-sky-300' },
  'colocation-fabric':    { bg: 'bg-gray-800/80',   border: 'border-gray-600',   text: 'text-gray-300' },
  'isp-handoff':          { bg: 'bg-gray-800/80',   border: 'border-gray-600',   text: 'text-gray-300' },
  // Access Control (also generic)
  'ac-server':            { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-controller':        { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-reader':            { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-door-hardware':     { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-intercom':          { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-biometric':         { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-key-pad':           { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-visitor-kiosk':     { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-elevator-ctrl':     { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
  'ac-turnstile':         { bg: 'bg-slate-800/80',  border: 'border-slate-700',  text: 'text-slate-300' },
}

const DEFAULT_STYLE: StyleEntry = { bg: 'bg-gray-800/80', border: 'border-gray-600', text: 'text-gray-300' }

export function GenericDeviceNode(props: NodeProps) {
  const data = props.data as DeviceData
  const deviceType = data.deviceType as DeviceType
  const style = DEVICE_COLORS[deviceType] ?? DEFAULT_STYLE

  return (
    <BaseNode
      {...props}
      data={data}
      icon={getDeviceIcon(deviceType, { className: style.text, size: 20 })}
      color={style.bg}
      borderColor={style.border}
    />
  )
}
