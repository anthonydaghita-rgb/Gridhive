import { type ReactNode } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { DeviceData } from '@gridhive/shared'
import { useValidationStore } from '../../../stores/validationStore'

interface BaseNodeProps extends NodeProps<Node<DeviceData>> {
  icon: ReactNode
  color: string
  borderColor?: string
}

export function BaseNode({ id, data, selected, icon, color, borderColor }: BaseNodeProps) {
  const { validationNodeStates, pathHighlightedNodes, pathBlockedNode } = useValidationStore()
  const highlightState = validationNodeStates[id]
  const isInPath = pathHighlightedNodes.includes(id)
  const isBlocked = pathBlockedNode === id

  let borderClass = borderColor || 'border-gray-700'
  if (selected) {
    borderClass = 'border-blue-400 ring-2 ring-blue-400/30'
  } else if (isBlocked) {
    borderClass = 'border-red-500 ring-2 ring-red-500/40 animate-pulse'
  } else if (isInPath) {
    borderClass = 'border-blue-400 ring-2 ring-blue-400/40'
  } else if (highlightState === 'error') {
    borderClass = 'border-red-500 ring-2 ring-red-500/30'
  } else if (highlightState === 'warning') {
    borderClass = 'border-yellow-500 ring-2 ring-yellow-500/30'
  } else if (highlightState === 'info') {
    borderClass = 'border-blue-400 ring-1 ring-blue-400/20'
  }

  const badgeIcon = highlightState === 'error'
    ? <AlertCircle className="w-3.5 h-3.5 text-red-400" />
    : highlightState === 'warning'
    ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
    : highlightState === 'info'
    ? <Info className="w-3.5 h-3.5 text-blue-400" />
    : null

  return (
    <div
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 bg-gray-900 min-w-[80px] cursor-pointer transition-all hover:border-gray-500 ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />

      {/* Severity badge */}
      {badgeIcon && (
        <div className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-0.5 border border-gray-700">
          {badgeIcon}
        </div>
      )}

      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>

      <div className="text-center">
        <p className="text-xs font-medium text-white leading-tight max-w-[90px] truncate">
          {data.label || data.hostname}
        </p>
        {data.ipAddress && (
          <p className="text-[10px] text-gray-500 leading-tight">{data.ipAddress}</p>
        )}
        {data.vlanId && (
          <p className="text-[10px] text-blue-400 leading-tight">VLAN {data.vlanId}</p>
        )}
      </div>
    </div>
  )
}
