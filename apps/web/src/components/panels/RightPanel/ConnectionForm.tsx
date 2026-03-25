import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Edge } from '@xyflow/react'
import type { ConnectionData, NetworkProtocol, ConnectionType } from '@gridhive/shared'
import { PROTOCOL_GROUPS, PROTOCOL_LABELS, CONNECTION_TYPE_GROUPS, CONNECTION_TYPE_LABELS } from '@gridhive/shared'
import { CONNECTION_STYLES } from '../../canvas/edges/NetworkEdge'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useProjectStore } from '../../../stores/projectStore'

interface ConnectionFormProps {
  edge: Edge<ConnectionData>
}

// ─── Type-specific field panels ───────────────────────────────────────────────

function TrunkFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Native VLAN</label>
        <input
          type="number"
          value={data?.nativeVlan || ''}
          onChange={e => update('nativeVlan', e.target.value ? parseInt(e.target.value) : undefined)}
          className="form-input"
          placeholder="1"
          min="1"
          max="4094"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Allowed VLANs (comma-separated)</label>
        <input
          type="text"
          value={data?.trunkVlans?.join(',') || ''}
          onChange={e => {
            const vlans = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
            update('trunkVlans', vlans.length > 0 ? vlans : undefined)
          }}
          className="form-input"
          placeholder="10,20,30,99"
        />
      </div>
    </>
  )
}

function AccessPortFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">VLAN Tag</label>
      <input
        type="number"
        value={data?.vlanTag || ''}
        onChange={e => update('vlanTag', e.target.value ? parseInt(e.target.value) : undefined)}
        className="form-input"
        placeholder="VLAN ID"
        min="1"
        max="4094"
      />
    </div>
  )
}

function IpsecFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Peer IP A</label>
          <input type="text" value={data?.peerIpA || ''} onChange={e => update('peerIpA', e.target.value || undefined)} className="form-input" placeholder="1.2.3.4" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Peer IP B</label>
          <input type="text" value={data?.peerIpB || ''} onChange={e => update('peerIpB', e.target.value || undefined)} className="form-input" placeholder="5.6.7.8" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Local Subnet</label>
          <input type="text" value={data?.localSubnet || ''} onChange={e => update('localSubnet', e.target.value || undefined)} className="form-input" placeholder="10.0.0.0/24" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Remote Subnet</label>
          <input type="text" value={data?.remoteSubnet || ''} onChange={e => update('remoteSubnet', e.target.value || undefined)} className="form-input" placeholder="192.168.0.0/24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">IKE Version</label>
          <select value={data?.ikeVersion || 2} onChange={e => update('ikeVersion', parseInt(e.target.value) as 1 | 2)} className="form-input">
            <option value={1}>IKEv1</option>
            <option value={2}>IKEv2</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">PSK</label>
          <input type="password" value={data?.psk || ''} onChange={e => update('psk', e.target.value || undefined)} className="form-input" placeholder="Pre-shared key" />
        </div>
      </div>
    </>
  )
}

function WireguardFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Peer IP A</label>
          <input type="text" value={data?.peerIpA || ''} onChange={e => update('peerIpA', e.target.value || undefined)} className="form-input" placeholder="1.2.3.4:51820" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Peer IP B</label>
          <input type="text" value={data?.peerIpB || ''} onChange={e => update('peerIpB', e.target.value || undefined)} className="form-input" placeholder="5.6.7.8:51820" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Allowed IPs (comma-separated)</label>
        <input
          type="text"
          value={data?.allowedIps?.join(', ') || ''}
          onChange={e => {
            const ips = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
            update('allowedIps', ips.length > 0 ? ips : undefined)
          }}
          className="form-input"
          placeholder="0.0.0.0/0"
        />
      </div>
    </>
  )
}

function BgpFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Local AS</label>
          <input type="number" value={data?.localAs || ''} onChange={e => update('localAs', e.target.value ? parseInt(e.target.value) : undefined)} className="form-input" placeholder="65001" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Remote AS</label>
          <input type="number" value={data?.remoteAs || ''} onChange={e => update('remoteAs', e.target.value ? parseInt(e.target.value) : undefined)} className="form-input" placeholder="65002" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">BGP Type</label>
          <select value={data?.bgpType || 'ebgp'} onChange={e => update('bgpType', e.target.value as 'ebgp' | 'ibgp')} className="form-input">
            <option value="ebgp">eBGP</option>
            <option value="ibgp">iBGP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Peer IP</label>
          <input type="text" value={data?.peerIpA || ''} onChange={e => update('peerIpA', e.target.value || undefined)} className="form-input" placeholder="10.0.0.1" />
        </div>
      </div>
    </>
  )
}

function OspfFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-400 mb-1">OSPF Area</label>
        <input type="text" value={data?.ospfArea || ''} onChange={e => update('ospfArea', e.target.value || undefined)} className="form-input" placeholder="0.0.0.0" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Cost</label>
        <input type="number" value={data?.ospfCost || ''} onChange={e => update('ospfCost', e.target.value ? parseInt(e.target.value) : undefined)} className="form-input" placeholder="1" min="1" />
      </div>
    </div>
  )
}

function WanCircuitFields({ data, update }: { data: ConnectionData | undefined; update: (field: keyof ConnectionData, value: unknown) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Provider Name</label>
        <input type="text" value={data?.providerName || ''} onChange={e => update('providerName', e.target.value || undefined)} className="form-input" placeholder="e.g. AT&T, Comcast" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Circuit ID</label>
          <input type="text" value={data?.circuitId || ''} onChange={e => update('circuitId', e.target.value || undefined)} className="form-input" placeholder="CKT-12345" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">CIR (Mbps)</label>
          <input type="number" value={data?.cirMbps || ''} onChange={e => update('cirMbps', e.target.value ? parseInt(e.target.value) : undefined)} className="form-input" placeholder="100" min="1" />
        </div>
      </div>
    </>
  )
}

function TypeSpecificFields({ connectionType, data, update }: {
  connectionType: ConnectionType
  data: ConnectionData | undefined
  update: (field: keyof ConnectionData, value: unknown) => void
}) {
  if (connectionType === 'trunk-8021q') return <TrunkFields data={data} update={update} />
  if (connectionType === 'access-port') return <AccessPortFields data={data} update={update} />
  if (connectionType === 'site-to-site-ipsec' || connectionType === 'site-to-site-ssl') return <IpsecFields data={data} update={update} />
  if (connectionType === 'wireguard') return <WireguardFields data={data} update={update} />
  if (connectionType === 'bgp') return <BgpFields data={data} update={update} />
  if (connectionType === 'ospf') return <OspfFields data={data} update={update} />
  if (connectionType === 'mpls' || connectionType === 'sd-wan') return <WanCircuitFields data={data} update={update} />
  return null
}

// ─── Connection type picker ────────────────────────────────────────────────────

function ConnectionTypePicker({
  value,
  onChange,
}: {
  value: ConnectionType | undefined
  onChange: (t: ConnectionType | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  const selectedLabel = value ? (CONNECTION_TYPE_LABELS[value] || value) : 'Select type...'
  const selectedStyle = value ? CONNECTION_STYLES[value] : undefined

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">Connection Type</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded border border-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selectedStyle && (
            <span
              className="inline-block w-3 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedStyle.strokeColor }}
            />
          )}
          {selectedLabel}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
      </button>

      {open && (
        <div className="mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
          {/* Clear option */}
          <button
            onClick={() => { onChange(undefined); setOpen(false) }}
            className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors text-gray-500 hover:bg-gray-700 italic`}
          >
            None (legacy)
          </button>

          {Object.entries(CONNECTION_TYPE_GROUPS).map(([group, types]) => (
            <div key={group}>
              <div className="px-2.5 py-1 text-[10px] text-gray-500 font-medium uppercase tracking-wide bg-gray-900/50">
                {group}
              </div>
              {types.map(t => {
                const style = CONNECTION_STYLES[t as ConnectionType]
                const isSelected = value === t
                return (
                  <button
                    key={t}
                    onClick={() => { onChange(t as ConnectionType); setOpen(false) }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {style && (
                        <span
                          className="inline-block w-3 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: style.strokeColor }}
                        />
                      )}
                      <span className="truncate">{CONNECTION_TYPE_LABELS[t] || t}</span>
                    </span>
                    {isSelected && <span className="text-blue-400 text-[10px] flex-shrink-0">✓</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main form ─────────────────────────────────────────────────────────────────

export function ConnectionForm({ edge }: ConnectionFormProps) {
  const { updateEdgeData, deleteEdge } = useCanvasStore()
  const { setDirty } = useProjectStore()
  const [showProtocolPicker, setShowProtocolPicker] = useState(false)
  const data = edge.data as ConnectionData | undefined

  const update = (field: keyof ConnectionData, value: unknown) => {
    updateEdgeData(edge.id, { [field]: value })
    setDirty(true)
  }

  const protocols = data?.protocols || []

  const toggleProtocol = (protocol: NetworkProtocol) => {
    const current = protocols
    const next = current.includes(protocol)
      ? current.filter(p => p !== protocol)
      : [...current, protocol]
    update('protocols', next.length > 0 ? next : undefined)
  }

  const removeProtocol = (protocol: NetworkProtocol) => {
    const next = protocols.filter(p => p !== protocol)
    update('protocols', next.length > 0 ? next : undefined)
  }

  const connectionType = data?.connectionType as ConnectionType | undefined

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
          Connection
        </span>
        <button
          onClick={() => deleteEdge(edge.id)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Connection type picker */}
      <ConnectionTypePicker
        value={connectionType}
        onChange={t => update('connectionType', t)}
      />

      {/* Type-specific fields */}
      {connectionType && (
        <TypeSpecificFields connectionType={connectionType} data={data} update={update} />
      )}

      {/* ── Legacy / shared fields ── */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Media Type</label>
        <select
          value={data?.mediaType || 'copper'}
          onChange={e => update('mediaType', e.target.value as ConnectionData['mediaType'])}
          className="form-input"
        >
          <option value="copper">Copper</option>
          <option value="fiber">Fiber</option>
          <option value="wireless">Wireless</option>
          <option value="sfp">SFP</option>
          <option value="wan">WAN</option>
          <option value="vpn">VPN</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Speed</label>
        <select
          value={data?.speed || '1G'}
          onChange={e => update('speed', e.target.value as ConnectionData['speed'])}
          className="form-input"
        >
          <option value="10M">10 Mbps</option>
          <option value="100M">100 Mbps</option>
          <option value="1G">1 Gbps</option>
          <option value="10G">10 Gbps</option>
          <option value="25G">25 Gbps</option>
          <option value="40G">40 Gbps</option>
          <option value="100G">100 Gbps</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Status</label>
        <select
          value={data?.status || 'active'}
          onChange={e => update('status', e.target.value as ConnectionData['status'])}
          className="form-input"
        >
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="deprecated">Deprecated</option>
          <option value="simulated-down">Simulated Down</option>
        </select>
      </div>

      {/* Show VLAN fields inline only when no connectionType drives them */}
      {!connectionType && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">VLAN Tag (Access)</label>
            <input
              type="number"
              value={data?.vlanTag || ''}
              onChange={e => update('vlanTag', e.target.value ? parseInt(e.target.value) : undefined)}
              className="form-input"
              placeholder="VLAN ID for access port"
              min="1"
              max="4094"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Trunk VLANs (comma-separated)</label>
            <input
              type="text"
              value={data?.trunkVlans?.join(',') || ''}
              onChange={e => {
                const vlans = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                update('trunkVlans', vlans.length > 0 ? vlans : undefined)
              }}
              className="form-input"
              placeholder="10,20,30,99"
            />
          </div>
        </>
      )}

      {/* Protocol multi-select */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Protocols (legacy)</label>

        {protocols.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {protocols.map(p => (
              <span
                key={p}
                className="inline-flex items-center gap-1 text-[10px] bg-blue-900/40 text-blue-300 border border-blue-800/50 rounded px-1.5 py-0.5"
              >
                {PROTOCOL_LABELS[p] || p}
                <button onClick={() => removeProtocol(p)} className="hover:text-white">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowProtocolPicker(!showProtocolPicker)}
          className="w-full flex items-center justify-between text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded border border-gray-700 transition-colors"
        >
          <span>{protocols.length === 0 ? 'Select protocols...' : 'Add more...'}</span>
          {showProtocolPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showProtocolPicker && (
          <div className="mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {Object.entries(PROTOCOL_GROUPS).map(([group, groupProtocols]) => (
              <div key={group}>
                <div className="px-2.5 py-1 text-[10px] text-gray-500 font-medium uppercase tracking-wide bg-gray-900/50">
                  {group}
                </div>
                {groupProtocols.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleProtocol(p as NetworkProtocol)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      protocols.includes(p as NetworkProtocol)
                        ? 'bg-blue-900/30 text-blue-300'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {PROTOCOL_LABELS[p] || p}
                    {protocols.includes(p as NetworkProtocol) && (
                      <span className="text-blue-400 text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {protocols.includes('custom') && (
          <input
            type="text"
            value={data?.customProtocol || ''}
            onChange={e => update('customProtocol', e.target.value || undefined)}
            className="form-input mt-1"
            placeholder="Custom protocol name"
          />
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Label</label>
        <input
          type="text"
          value={data?.label || ''}
          onChange={e => update('label', e.target.value || undefined)}
          className="form-input"
          placeholder="Connection label"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Notes</label>
        <textarea
          value={data?.notes || ''}
          onChange={e => update('notes', e.target.value || undefined)}
          className="form-input resize-none"
          placeholder="Optional notes"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data?.poe || false}
            onChange={e => update('poe', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className="text-xs text-gray-400">PoE</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data?.uplink || false}
            onChange={e => update('uplink', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className="text-xs text-gray-400">Uplink</span>
        </label>
      </div>
    </div>
  )
}
