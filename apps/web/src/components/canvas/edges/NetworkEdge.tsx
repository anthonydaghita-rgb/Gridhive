import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import type { ConnectionData } from '@gridhive/shared'

const STATUS_COLORS = {
  'active': '#4b5563',
  'planned': '#6366f1',
  'deprecated': '#9ca3af',
  'simulated-down': '#ef4444',
} as const

const MEDIA_COLORS = {
  'fiber': '#f59e0b',
  'wan': '#8b5cf6',
  'vpn': '#06b6d4',
  'wireless': '#10b981',
  'copper': '#4b5563',
  'sfp': '#f59e0b',
} as const

export function NetworkEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected,
}: EdgeProps<ConnectionData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const edgeData = data as ConnectionData | undefined
  const status = edgeData?.status || 'active'
  const mediaType = edgeData?.mediaType || 'copper'

  const strokeColor = selected
    ? '#3b82f6'
    : status === 'simulated-down'
    ? STATUS_COLORS['simulated-down']
    : MEDIA_COLORS[mediaType] || '#4b5563'

  const strokeDash = status === 'planned' ? '5,5' : status === 'simulated-down' ? '8,4' : undefined

  const label = edgeData?.label || edgeData?.protocol

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: strokeDash,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded border border-gray-700">
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
