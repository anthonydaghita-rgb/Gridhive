import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Edge } from '@xyflow/react'
import type { ConnectionData, NetworkProtocol } from '@gridhive/shared'
import { PROTOCOL_GROUPS, PROTOCOL_LABELS } from '@gridhive/shared'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useProjectStore } from '../../../stores/projectStore'

interface ConnectionFormProps {
  edge: Edge<ConnectionData>
}

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

      {/* Protocol multi-select */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Protocols</label>

        {/* Selected protocol badges */}
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
