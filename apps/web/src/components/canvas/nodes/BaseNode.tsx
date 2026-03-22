import { type ReactNode } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { useValidationStore } from '../../../stores/validationStore'
import { useCanvasStore } from '../../../stores/canvasStore'

interface BaseNodeProps extends NodeProps<Node<DeviceData>> {
  icon: ReactNode
  color: string
  borderColor?: string
}

export function BaseNode({ id, data, selected, icon, color, borderColor }: BaseNodeProps) {
  const { highlightedNodeIds } = useValidationStore()
  const isHighlighted = highlightedNodeIds.includes(id)

  const borderClass = selected
    ? 'border-blue-400 ring-2 ring-blue-400/30'
    : isHighlighted
    ? 'border-yellow-400 ring-2 ring-yellow-400/30'
    : borderColor || 'border-gray-700'

  return (
    <div
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 bg-gray-900 min-w-[80px] cursor-pointer transition-all hover:border-gray-500 ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-gray-600 !border-gray-500" />

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
