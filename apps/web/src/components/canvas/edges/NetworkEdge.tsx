import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react'
import type { ConnectionData, ConnectionType } from '@gridhive/shared'
import { CONNECTION_TYPE_LABELS } from '@gridhive/shared'

interface ConnectionStyle {
  strokeColor: string
  strokeWidth: number
  strokeDash?: string
  animated?: boolean
  glowColor?: string
}

export const CONNECTION_STYLES: Record<ConnectionType, ConnectionStyle> = {
  'ethernet-copper':    { strokeColor: '#94a3b8', strokeWidth: 2 },
  'ethernet-fiber':     { strokeColor: '#60a5fa', strokeWidth: 2 },
  'ethernet-sfp':       { strokeColor: '#60a5fa', strokeWidth: 2 },
  'ethernet-dac':       { strokeColor: '#a78bfa', strokeWidth: 2 },
  'wifi':               { strokeColor: '#34d399', strokeWidth: 1.5, strokeDash: '5,3' },
  'wifi-backhaul':      { strokeColor: '#10b981', strokeWidth: 1.5, strokeDash: '5,3' },
  'trunk-8021q':        { strokeColor: '#a78bfa', strokeWidth: 3 },
  'access-port':        { strokeColor: '#6b7280', strokeWidth: 1.5 },
  'qinq':               { strokeColor: '#8b5cf6', strokeWidth: 2, strokeDash: '3,2' },
  'vlan-routing':       { strokeColor: '#a78bfa', strokeWidth: 2, strokeDash: '4,2' },
  'site-to-site-ipsec': { strokeColor: '#f59e0b', strokeWidth: 2, strokeDash: '10,5', glowColor: '#f59e0b40' },
  'site-to-site-ssl':   { strokeColor: '#f59e0b', strokeWidth: 2, strokeDash: '10,5', glowColor: '#f59e0b40' },
  'wireguard':          { strokeColor: '#8b5cf6', strokeWidth: 2, strokeDash: '7,3', glowColor: '#8b5cf640' },
  'ssl-vpn-client':     { strokeColor: '#ec4899', strokeWidth: 1.5, strokeDash: '2,4' },
  'l2tp':               { strokeColor: '#f472b6', strokeWidth: 1.5, strokeDash: '4,3' },
  'gre-tunnel':         { strokeColor: '#fb923c', strokeWidth: 2, strokeDash: '8,4' },
  'vxlan':              { strokeColor: '#06b6d4', strokeWidth: 2, strokeDash: '5,3' },
  'geneve':             { strokeColor: '#06b6d4', strokeWidth: 2, strokeDash: '4,2' },
  'ipsec-dmvpn':        { strokeColor: '#f59e0b', strokeWidth: 2, strokeDash: '8,3', glowColor: '#f59e0b30' },
  'cloud-vpn':          { strokeColor: '#0ea5e9', strokeWidth: 2, strokeDash: '6,3' },
  'mpls':               { strokeColor: '#f97316', strokeWidth: 3 },
  'sd-wan':             { strokeColor: '#06b6d4', strokeWidth: 2, animated: true },
  'ospf':               { strokeColor: '#10b981', strokeWidth: 1.5 },
  'bgp':                { strokeColor: '#0ea5e9', strokeWidth: 2 },
  'eigrp':              { strokeColor: '#34d399', strokeWidth: 1.5 },
  'routed-static':      { strokeColor: '#6b7280', strokeWidth: 1.5, strokeDash: '4,2' },
  'profinet':           { strokeColor: '#ef4444', strokeWidth: 2 },
  'modbus-tcp':         { strokeColor: '#f59e0b', strokeWidth: 1.5 },
  'bacnet':             { strokeColor: '#84cc16', strokeWidth: 1.5 },
  'dnp3':               { strokeColor: '#f59e0b', strokeWidth: 1.5, strokeDash: '3,2' },
  'opc-ua':             { strokeColor: '#38bdf8', strokeWidth: 1.5 },
  'iec-61850':          { strokeColor: '#fbbf24', strokeWidth: 2 },
  'ethernet-ip':        { strokeColor: '#f97316', strokeWidth: 2 },
  'fibre-channel':      { strokeColor: '#a855f7', strokeWidth: 3 },
  'iscsi':              { strokeColor: '#7c3aed', strokeWidth: 2 },
  'nfs':                { strokeColor: '#6366f1', strokeWidth: 1.5, strokeDash: '4,2' },
  'smb':                { strokeColor: '#6366f1', strokeWidth: 1.5, strokeDash: '2,2' },
  'poe':                { strokeColor: '#22d3ee', strokeWidth: 1.5 },
  'poe-plus':           { strokeColor: '#06b6d4', strokeWidth: 2 },
  'poe-bt':             { strokeColor: '#0891b2', strokeWidth: 2 },
  'osdp':               { strokeColor: '#475569', strokeWidth: 1, strokeDash: '3,3' },
  'wiegand':            { strokeColor: '#374151', strokeWidth: 1, strokeDash: '2,3' },
  'dante':              { strokeColor: '#8b5cf6', strokeWidth: 1.5 },
  'aes67':              { strokeColor: '#7c3aed', strokeWidth: 1.5 },
  'smpte-st-2110':      { strokeColor: '#5b21b6', strokeWidth: 2 },
  'snmp':               { strokeColor: '#64748b', strokeWidth: 1 },
  'netflow':            { strokeColor: '#475569', strokeWidth: 1, strokeDash: '3,3' },
  'syslog':             { strokeColor: '#475569', strokeWidth: 1, strokeDash: '2,3' },
  'restful-api':        { strokeColor: '#0ea5e9', strokeWidth: 1 },
  'ssh':                { strokeColor: '#475569', strokeWidth: 1 },
  'rdp':                { strokeColor: '#0369a1', strokeWidth: 1 },
  'fortilink':          { strokeColor: '#dc2626', strokeWidth: 2 },
  'unifi-adopt':        { strokeColor: '#2563eb', strokeWidth: 2 },
  'internet-access':    { strokeColor: '#64748b', strokeWidth: 2 },
  'saas-connection':    { strokeColor: '#475569', strokeWidth: 1.5, strokeDash: '4,3' },
  'direct-connect':     { strokeColor: '#f59e0b', strokeWidth: 3 },
  'peering':            { strokeColor: '#0ea5e9', strokeWidth: 2 },
  'bluetooth':          { strokeColor: '#3b82f6', strokeWidth: 1, strokeDash: '2,3' },
  'serial-console':     { strokeColor: '#92400e', strokeWidth: 1 },
  'can-bus':            { strokeColor: '#78350f', strokeWidth: 1.5 },
  'fieldbus':           { strokeColor: '#92400e', strokeWidth: 1.5 },
  'oob-console':        { strokeColor: '#374151', strokeWidth: 1, strokeDash: '3,2' },
}

function getConnectionStyle(data: ConnectionData | undefined, selected: boolean): ConnectionStyle & { strokeColor: string } {
  if (selected) return { strokeColor: '#3b82f6', strokeWidth: 3 }
  if (data?.status === 'simulated-down') return { strokeColor: '#ef4444', strokeWidth: 2, strokeDash: '8,4' }

  if (data?.connectionType && CONNECTION_STYLES[data.connectionType]) {
    return CONNECTION_STYLES[data.connectionType]
  }

  // Legacy fallback: use mediaType/protocol
  const mediaColors: Record<string, string> = {
    'fiber': '#60a5fa', 'wan': '#8b5cf6', 'vpn': '#06b6d4', 'wireless': '#10b981', 'copper': '#4b5563', 'sfp': '#60a5fa',
  }
  return { strokeColor: mediaColors[data?.mediaType || 'copper'] || '#4b5563', strokeWidth: 2 }
}

function getConnectionLabel(data: ConnectionData | undefined): string | null {
  if (data?.label) return data.label
  if (data?.connectionType) {
    const label = CONNECTION_TYPE_LABELS[data.connectionType]
    if (data.connectionType === 'trunk-8021q' && data.trunkVlans?.length) {
      return `Trunk: ${data.trunkVlans.slice(0, 3).join(',')}${data.trunkVlans.length > 3 ? '...' : ''}`
    }
    if (data.connectionType === 'access-port' && data.vlanTag) {
      return `VLAN ${data.vlanTag}`
    }
    if (data.connectionType === 'bgp') {
      return data.remoteAs ? `BGP AS${data.remoteAs}` : 'BGP'
    }
    return label || data.connectionType
  }
  // Legacy protocol label
  const protocols = data?.protocols || []
  if (protocols.length === 0) return null
  return protocols[0]
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
  const style = getConnectionStyle(edgeData, selected ?? false)
  const label = getConnectionLabel(edgeData)
  const filterId = `glow-${id}`
  const hasGlow = !selected && style.glowColor

  // Apply planned status dash override when no connectionType is set
  let strokeDash = style.strokeDash
  if (!strokeDash && !edgeData?.connectionType) {
    const status = edgeData?.status || 'active'
    if (status === 'planned') strokeDash = '5,5'
  }

  return (
    <>
      {hasGlow && (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={style.glowColor} floodOpacity="1" />
          </filter>
        </defs>
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          strokeDasharray: strokeDash,
          filter: hasGlow ? `url(#${filterId})` : undefined,
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
