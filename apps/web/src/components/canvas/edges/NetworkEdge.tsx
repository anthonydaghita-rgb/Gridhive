import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react'
import type { ConnectionData, ConnectionType } from '@gridhive/shared'
import { CONNECTION_TYPE_LABELS } from '@gridhive/shared'

interface ConnectionStyle {
  strokeColor: string
  strokeWidth: number
  strokeDash?: string
  glowColor?: string
  flowColor?: string   // color of the data-flow animation overlay
  flowSpeed?: number   // animation duration in seconds (lower = faster)
}

export const CONNECTION_STYLES: Record<ConnectionType, ConnectionStyle> = {
  'ethernet-copper':    { strokeColor: '#94a3b8', strokeWidth: 2,   flowColor: '#cbd5e1', flowSpeed: 2 },
  'ethernet-fiber':     { strokeColor: '#60a5fa', strokeWidth: 2,   flowColor: '#93c5fd', flowSpeed: 1.5 },
  'ethernet-sfp':       { strokeColor: '#60a5fa', strokeWidth: 2,   flowColor: '#93c5fd', flowSpeed: 1.5 },
  'ethernet-dac':       { strokeColor: '#a78bfa', strokeWidth: 2,   flowColor: '#c4b5fd', flowSpeed: 1.5 },
  'wifi':               { strokeColor: '#34d399', strokeWidth: 1.5, strokeDash: '5,3',   flowColor: '#6ee7b7', flowSpeed: 2.5 },
  'wifi-backhaul':      { strokeColor: '#10b981', strokeWidth: 2,   strokeDash: '5,3',   flowColor: '#34d399', flowSpeed: 2 },
  'trunk-8021q':        { strokeColor: '#a78bfa', strokeWidth: 3.5, flowColor: '#c4b5fd', flowSpeed: 1, glowColor: '#a78bfa30' },
  'access-port':        { strokeColor: '#6b7280', strokeWidth: 1.5, flowColor: '#9ca3af', flowSpeed: 2.5 },
  'qinq':               { strokeColor: '#8b5cf6', strokeWidth: 2,   strokeDash: '3,2',   flowColor: '#a78bfa', flowSpeed: 1.5 },
  'vlan-routing':       { strokeColor: '#a78bfa', strokeWidth: 2,   strokeDash: '4,2',   flowColor: '#c4b5fd', flowSpeed: 2 },
  'site-to-site-ipsec': { strokeColor: '#f59e0b', strokeWidth: 2,   strokeDash: '10,5',  flowColor: '#fbbf24', flowSpeed: 1.8, glowColor: '#f59e0b40' },
  'site-to-site-ssl':   { strokeColor: '#f59e0b', strokeWidth: 2,   strokeDash: '10,5',  flowColor: '#fbbf24', flowSpeed: 1.8, glowColor: '#f59e0b40' },
  'wireguard':          { strokeColor: '#8b5cf6', strokeWidth: 2,   strokeDash: '7,3',   flowColor: '#a78bfa', flowSpeed: 1.5, glowColor: '#8b5cf640' },
  'ssl-vpn-client':     { strokeColor: '#ec4899', strokeWidth: 1.5, strokeDash: '2,4',   flowColor: '#f472b6', flowSpeed: 2 },
  'l2tp':               { strokeColor: '#f472b6', strokeWidth: 1.5, strokeDash: '4,3',   flowColor: '#f9a8d4', flowSpeed: 2 },
  'gre-tunnel':         { strokeColor: '#fb923c', strokeWidth: 2,   strokeDash: '8,4',   flowColor: '#fdba74', flowSpeed: 2 },
  'vxlan':              { strokeColor: '#06b6d4', strokeWidth: 2,   strokeDash: '5,3',   flowColor: '#22d3ee', flowSpeed: 1.5 },
  'geneve':             { strokeColor: '#06b6d4', strokeWidth: 2,   strokeDash: '4,2',   flowColor: '#22d3ee', flowSpeed: 1.5 },
  'ipsec-dmvpn':        { strokeColor: '#f59e0b', strokeWidth: 2,   strokeDash: '8,3',   flowColor: '#fbbf24', flowSpeed: 1.5, glowColor: '#f59e0b30' },
  'cloud-vpn':          { strokeColor: '#0ea5e9', strokeWidth: 2,   strokeDash: '6,3',   flowColor: '#38bdf8', flowSpeed: 2 },
  'mpls':               { strokeColor: '#f97316', strokeWidth: 3,   flowColor: '#fb923c', flowSpeed: 1, glowColor: '#f9731630' },
  'sd-wan':             { strokeColor: '#06b6d4', strokeWidth: 2.5, flowColor: '#22d3ee', flowSpeed: 1, glowColor: '#06b6d430' },
  'ospf':               { strokeColor: '#10b981', strokeWidth: 2,   flowColor: '#34d399', flowSpeed: 2 },
  'bgp':                { strokeColor: '#0ea5e9', strokeWidth: 2,   flowColor: '#38bdf8', flowSpeed: 2 },
  'eigrp':              { strokeColor: '#34d399', strokeWidth: 1.5, flowColor: '#6ee7b7', flowSpeed: 2 },
  'routed-static':      { strokeColor: '#6b7280', strokeWidth: 1.5, strokeDash: '4,2',   flowColor: '#9ca3af', flowSpeed: 2.5 },
  'profinet':           { strokeColor: '#ef4444', strokeWidth: 2,   flowColor: '#f87171', flowSpeed: 1.5 },
  'modbus-tcp':         { strokeColor: '#f59e0b', strokeWidth: 1.5, flowColor: '#fbbf24', flowSpeed: 2 },
  'bacnet':             { strokeColor: '#84cc16', strokeWidth: 1.5, flowColor: '#a3e635', flowSpeed: 2 },
  'dnp3':               { strokeColor: '#f59e0b', strokeWidth: 1.5, strokeDash: '3,2',   flowColor: '#fbbf24', flowSpeed: 2 },
  'opc-ua':             { strokeColor: '#38bdf8', strokeWidth: 1.5, flowColor: '#7dd3fc', flowSpeed: 2 },
  'iec-61850':          { strokeColor: '#fbbf24', strokeWidth: 2,   flowColor: '#fde68a', flowSpeed: 1.5 },
  'ethernet-ip':        { strokeColor: '#f97316', strokeWidth: 2,   flowColor: '#fb923c', flowSpeed: 1.5 },
  'fibre-channel':      { strokeColor: '#a855f7', strokeWidth: 3,   flowColor: '#c084fc', flowSpeed: 1, glowColor: '#a855f730' },
  'iscsi':              { strokeColor: '#7c3aed', strokeWidth: 2,   flowColor: '#8b5cf6', flowSpeed: 1.5 },
  'nfs':                { strokeColor: '#6366f1', strokeWidth: 1.5, strokeDash: '4,2',   flowColor: '#818cf8', flowSpeed: 2 },
  'smb':                { strokeColor: '#6366f1', strokeWidth: 1.5, strokeDash: '2,2',   flowColor: '#818cf8', flowSpeed: 2 },
  'poe':                { strokeColor: '#22d3ee', strokeWidth: 2,   flowColor: '#67e8f9', flowSpeed: 2 },
  'poe-plus':           { strokeColor: '#06b6d4', strokeWidth: 2.5, flowColor: '#22d3ee', flowSpeed: 1.5 },
  'poe-bt':             { strokeColor: '#0891b2', strokeWidth: 3,   flowColor: '#06b6d4', flowSpeed: 1.5 },
  'osdp':               { strokeColor: '#475569', strokeWidth: 1,   strokeDash: '3,3',   flowColor: '#64748b', flowSpeed: 3 },
  'wiegand':            { strokeColor: '#374151', strokeWidth: 1,   strokeDash: '2,3',   flowColor: '#4b5563', flowSpeed: 3 },
  'dante':              { strokeColor: '#8b5cf6', strokeWidth: 1.5, flowColor: '#a78bfa', flowSpeed: 2 },
  'aes67':              { strokeColor: '#7c3aed', strokeWidth: 1.5, flowColor: '#8b5cf6', flowSpeed: 2 },
  'smpte-st-2110':      { strokeColor: '#5b21b6', strokeWidth: 2,   flowColor: '#7c3aed', flowSpeed: 1.5 },
  'snmp':               { strokeColor: '#64748b', strokeWidth: 1,   flowColor: '#94a3b8', flowSpeed: 3 },
  'netflow':            { strokeColor: '#475569', strokeWidth: 1,   strokeDash: '3,3',   flowColor: '#64748b', flowSpeed: 3 },
  'syslog':             { strokeColor: '#475569', strokeWidth: 1,   strokeDash: '2,3',   flowColor: '#64748b', flowSpeed: 3 },
  'restful-api':        { strokeColor: '#0ea5e9', strokeWidth: 1,   flowColor: '#38bdf8', flowSpeed: 2.5 },
  'ssh':                { strokeColor: '#475569', strokeWidth: 1,   flowColor: '#64748b', flowSpeed: 3 },
  'rdp':                { strokeColor: '#0369a1', strokeWidth: 1,   flowColor: '#0ea5e9', flowSpeed: 2.5 },
  'fortilink':          { strokeColor: '#dc2626', strokeWidth: 2,   flowColor: '#ef4444', flowSpeed: 1.5 },
  'unifi-adopt':        { strokeColor: '#2563eb', strokeWidth: 2,   flowColor: '#3b82f6', flowSpeed: 1.5 },
  'internet-access':    { strokeColor: '#64748b', strokeWidth: 2,   flowColor: '#94a3b8', flowSpeed: 2 },
  'saas-connection':    { strokeColor: '#475569', strokeWidth: 1.5, strokeDash: '4,3',   flowColor: '#64748b', flowSpeed: 2.5 },
  'direct-connect':     { strokeColor: '#f59e0b', strokeWidth: 3,   flowColor: '#fbbf24', flowSpeed: 1, glowColor: '#f59e0b30' },
  'peering':            { strokeColor: '#0ea5e9', strokeWidth: 2,   flowColor: '#38bdf8', flowSpeed: 2 },
  'bluetooth':          { strokeColor: '#3b82f6', strokeWidth: 1,   strokeDash: '2,3',   flowColor: '#60a5fa', flowSpeed: 3 },
  'serial-console':     { strokeColor: '#92400e', strokeWidth: 1,   flowColor: '#b45309', flowSpeed: 3 },
  'can-bus':            { strokeColor: '#78350f', strokeWidth: 1.5, flowColor: '#92400e', flowSpeed: 2.5 },
  'fieldbus':           { strokeColor: '#92400e', strokeWidth: 1.5, flowColor: '#b45309', flowSpeed: 2.5 },
  'oob-console':        { strokeColor: '#374151', strokeWidth: 1,   strokeDash: '3,2',   flowColor: '#4b5563', flowSpeed: 3 },
}

function getConnectionStyle(data: ConnectionData | undefined, selected: boolean): ConnectionStyle & { strokeColor: string } {
  if (selected) return { strokeColor: '#3b82f6', strokeWidth: 3, flowColor: '#60a5fa', flowSpeed: 1.5 }
  if (data?.status === 'simulated-down') return { strokeColor: '#ef4444', strokeWidth: 2, strokeDash: '8,4' }

  if (data?.connectionType && CONNECTION_STYLES[data.connectionType as ConnectionType]) {
    return CONNECTION_STYLES[data.connectionType as ConnectionType]
  }

  const mediaColors: Record<string, string> = {
    'fiber': '#60a5fa', 'wan': '#8b5cf6', 'vpn': '#06b6d4',
    'wireless': '#10b981', 'copper': '#4b5563', 'sfp': '#60a5fa',
  }
  return {
    strokeColor: mediaColors[data?.mediaType || 'copper'] || '#4b5563',
    strokeWidth: 2,
    flowColor: '#6b7280',
    flowSpeed: 2.5,
  }
}

// Build multi-line label lines for the edge badge
function getLabelLines(data: ConnectionData | undefined): string[] {
  if (!data) return []
  const lines: string[] = []

  // Primary: custom label or connection type
  if (data.label) {
    lines.push(data.label)
  } else if (data.connectionType) {
    const ct = data.connectionType as ConnectionType
    const typeLabel = CONNECTION_TYPE_LABELS[ct] || ct
    if (ct === 'trunk-8021q') {
      lines.push('Trunk 802.1Q')
      if (data.trunkVlans && Array.isArray(data.trunkVlans) && (data.trunkVlans as number[]).length > 0) {
        const vlans = data.trunkVlans as number[]
        lines.push(`VLANs: ${vlans.slice(0, 4).join(', ')}${vlans.length > 4 ? '…' : ''}`)
        if ((data.nativeVlan as number | undefined)) lines.push(`Native: ${data.nativeVlan}`)
      }
    } else if (ct === 'access-port') {
      lines.push('Access Port')
      if (data.vlanTag) lines.push(`VLAN ${data.vlanTag}`)
    } else if (ct === 'bgp') {
      lines.push('BGP')
      if (data.localAs && data.remoteAs) lines.push(`AS${data.localAs} ↔ AS${data.remoteAs}`)
      else if (data.remoteAs) lines.push(`Peer AS${data.remoteAs}`)
    } else if (ct === 'ospf') {
      lines.push('OSPF')
      if (data.ospfArea) lines.push(`Area ${data.ospfArea}`)
    } else if (ct === 'site-to-site-ipsec' || ct === 'site-to-site-ssl') {
      lines.push(typeLabel)
      if (data.peerIpA) lines.push(data.peerIpA as string)
    } else if (ct === 'wireguard') {
      lines.push('WireGuard')
      if (data.allowedIps && Array.isArray(data.allowedIps)) {
        lines.push((data.allowedIps as string[]).slice(0, 2).join(', '))
      }
    } else if (ct === 'mpls' || ct === 'sd-wan') {
      lines.push(typeLabel)
      if (data.providerName) lines.push(data.providerName as string)
      if (data.circuitId) lines.push(data.circuitId as string)
    } else {
      lines.push(typeLabel)
    }
  }

  // Secondary: speed
  if (data.speed && data.speed !== 'variable') {
    lines.push(data.speed as string)
  }

  // Secondary: PoE indicator
  if (data.poe) lines.push('PoE')

  // Planned / deprecated badge
  if (data.status === 'planned') lines.push('(planned)')
  if (data.status === 'deprecated') lines.push('(deprecated)')

  // Legacy protocol fallback
  if (lines.length === 0) {
    const protocols = data.protocols as string[] | undefined
    if (protocols && protocols.length > 0) lines.push(protocols[0])
  }

  return lines
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
  const labelLines = getLabelLines(edgeData)
  const filterId = `glow-${id}`
  const hasGlow = !selected && style.glowColor

  let strokeDash = style.strokeDash
  if (!strokeDash && !edgeData?.connectionType && edgeData?.status === 'planned') {
    strokeDash = '5,5'
  }

  // Data flow animation: flowing dashes on a second path overlay
  const isDown = edgeData?.status === 'simulated-down'
  const showFlow = !isDown && style.flowColor
  // animationDuration via CSS custom property on the element
  const flowDuration = `${style.flowSpeed ?? 2}s`

  return (
    <>
      {/* Glow filter definition */}
      {hasGlow && (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={style.glowColor} floodOpacity="1" />
          </filter>
        </defs>
      )}

      {/* Base edge line */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          strokeDasharray: strokeDash,
          filter: hasGlow ? `url(#${filterId})` : undefined,
          opacity: isDown ? 0.5 : 1,
        }}
      />

      {/* Data-flow animation overlay — flowing dashes in direction of connection */}
      {showFlow && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.flowColor}
          strokeWidth={Math.max(1, (style.strokeWidth ?? 2) * 0.6)}
          strokeDasharray="12,20"
          strokeLinecap="round"
          style={{
            animation: `gridhive-flow ${flowDuration} linear infinite`,
            opacity: 0.75,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Label badge */}
      {labelLines.length > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="flex flex-col items-center bg-gray-900/95 border rounded px-2 py-1 shadow-lg"
              style={{ borderColor: style.strokeColor + '80', minWidth: 48 }}
            >
              {labelLines.map((line, i) => (
                <span
                  key={i}
                  className={i === 0
                    ? 'text-[10px] font-semibold leading-tight whitespace-nowrap'
                    : 'text-[9px] leading-tight whitespace-nowrap opacity-75'
                  }
                  style={{ color: i === 0 ? style.strokeColor : '#9ca3af' }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
