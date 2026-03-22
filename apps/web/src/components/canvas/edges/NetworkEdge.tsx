import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react'
import type { ConnectionData, NetworkProtocol } from '@gridhive/shared'
import { PROTOCOL_LABELS } from '@gridhive/shared'

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

function getProtocolStyle(protocols: NetworkProtocol[]): { dash?: string; color?: string } {
  if (protocols.length === 0) return {}

  const primary = protocols[0]
  // WAN/Tunneling: dashed
  const wanProtocols = ['mpls', 'sd-wan', 'site-to-site-vpn', 'gre-tunnel']
  // VPN: dotted
  const vpnProtocols = ['ssl-vpn', 'wireguard']
  // Industrial: solid orange
  const industrialProtocols = ['profinet', 'ethernet-ip', 'modbus-tcp', 'bacnet', 'dnp3']

  if (vpnProtocols.includes(primary)) return { dash: '3,4', color: '#06b6d4' }
  if (wanProtocols.includes(primary)) return { dash: '8,4', color: '#8b5cf6' }
  if (industrialProtocols.includes(primary)) return { color: '#f97316' }

  return {}
}

function getEdgeLabel(data: ConnectionData): string | null {
  if (data.label) return data.label

  const protocols = data.protocols || []
  if (protocols.length === 0) return null

  const primary = protocols[0]
  const label = data.customProtocol && primary === 'custom'
    ? data.customProtocol
    : (PROTOCOL_LABELS[primary] || primary)

  return protocols.length > 1 ? `${label} +${protocols.length - 1}` : label
}

export function NetworkEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected,
}: EdgeProps<Edge<ConnectionData>>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const edgeData = data as ConnectionData | undefined
  const status = edgeData?.status || 'active'
  const mediaType = edgeData?.mediaType || 'copper'
  const protocols = edgeData?.protocols || []

  const protocolStyle = getProtocolStyle(protocols)

  const strokeColor = selected
    ? '#3b82f6'
    : status === 'simulated-down'
    ? STATUS_COLORS['simulated-down']
    : protocolStyle.color || MEDIA_COLORS[mediaType] || '#4b5563'

  let strokeDash = protocolStyle.dash
  if (!strokeDash) {
    if (status === 'planned') strokeDash = '5,5'
    else if (status === 'simulated-down') strokeDash = '8,4'
  }

  const label = getEdgeLabel(edgeData || {})

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
