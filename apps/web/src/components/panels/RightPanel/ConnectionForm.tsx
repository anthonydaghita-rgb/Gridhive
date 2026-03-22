import type { Edge } from '@xyflow/react'
import type { ConnectionData } from '@gridhive/shared'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useProjectStore } from '../../../stores/projectStore'

interface ConnectionFormProps {
  edge: Edge<ConnectionData>
}

export function ConnectionForm({ edge }: ConnectionFormProps) {
  const { updateEdgeData, deleteEdge } = useCanvasStore()
  const { setDirty } = useProjectStore()
  const data = edge.data as ConnectionData | undefined

  const update = (field: keyof ConnectionData, value: string | number | boolean | number[] | undefined) => {
    updateEdgeData(edge.id, { [field]: value })
    setDirty(true)
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
        <label className="block text-xs text-gray-400 mb-1">Protocol</label>
        <input
          type="text"
          value={data?.protocol || ''}
          onChange={e => update('protocol', e.target.value || undefined)}
          className="form-input"
          placeholder="e.g. MPLS, PROFINET"
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
