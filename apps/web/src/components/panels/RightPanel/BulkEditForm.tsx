import { useState } from 'react'
import { Layers, Trash2, Check } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useProjectStore } from '../../../stores/projectStore'
import type { DeviceData } from '@gridhive/shared'

interface BulkEditFormProps {
  nodeIds: string[]
}

export function BulkEditForm({ nodeIds }: BulkEditFormProps) {
  const { nodes, bulkUpdateNodeData, deleteNode } = useCanvasStore()
  const { setDirty } = useProjectStore()

  const selectedNodes = nodes.filter(n => nodeIds.includes(n.id))
  const deviceTypes = [...new Set(selectedNodes.map(n => n.data.deviceType))]

  const [fields, setFields] = useState<Partial<DeviceData>>({})
  const [applied, setApplied] = useState(false)

  function setField(key: keyof DeviceData, value: string | number | undefined) {
    setFields(prev => ({ ...prev, [key]: value }))
    setApplied(false)
  }

  function applyChanges() {
    const updates: Partial<DeviceData> = {}
    for (const [k, v] of Object.entries(fields)) {
      if (v !== '' && v !== undefined) updates[k as keyof DeviceData] = v as never
    }
    if (Object.keys(updates).length === 0) return
    bulkUpdateNodeData(nodeIds, updates)
    setDirty(true)
    setApplied(true)
  }

  function deleteAll() {
    for (const id of nodeIds) deleteNode(id)
    setDirty(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-800/40 rounded-lg p-2.5">
        <Layers className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-blue-300">{nodeIds.length} devices selected</p>
          <p className="text-[10px] text-blue-400/70 truncate">{deviceTypes.join(', ')}</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Fields left blank will not be changed. Only filled fields will be applied to all selected devices.
      </p>

      {/* VLAN */}
      <Field label="VLAN ID">
        <input
          type="number"
          placeholder="e.g. 10"
          className="form-input"
          onChange={e => setField('vlanId', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </Field>

      {/* Subnet mask */}
      <Field label="Subnet Mask">
        <input
          type="text"
          placeholder="e.g. 255.255.255.0"
          className="form-input"
          onChange={e => setField('subnet', e.target.value || undefined)}
        />
      </Field>

      {/* Default gateway */}
      <Field label="Default Gateway">
        <input
          type="text"
          placeholder="e.g. 192.168.1.1"
          className="form-input"
          onChange={e => setField('defaultGateway', e.target.value || undefined)}
        />
      </Field>

      {/* Manufacturer */}
      <Field label="Manufacturer">
        <input
          type="text"
          placeholder="e.g. Cisco"
          className="form-input"
          onChange={e => setField('manufacturer', e.target.value || undefined)}
        />
      </Field>

      {/* Role */}
      <Field label="Role">
        <input
          type="text"
          placeholder="e.g. access-switch"
          className="form-input"
          onChange={e => setField('role', e.target.value || undefined)}
        />
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <input
          type="text"
          placeholder="Add a note..."
          className="form-input"
          onChange={e => setField('notes', e.target.value || undefined)}
        />
      </Field>

      {/* Apply button */}
      <button
        onClick={applyChanges}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
          applied
            ? 'bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {applied ? <><Check className="w-4 h-4" /> Applied</> : 'Apply to All Selected'}
      </button>

      {/* Delete all */}
      <button
        onClick={deleteAll}
        className="w-full flex items-center justify-center gap-2 py-2 rounded text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/30 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete All Selected ({nodeIds.length})
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}
