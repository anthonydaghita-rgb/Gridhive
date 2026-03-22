import type { Node } from '@xyflow/react'
import type { DeviceData } from '@gridhive/shared'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useProjectStore } from '../../../stores/projectStore'

interface DeviceFormProps {
  node: Node<DeviceData>
}

export function DeviceForm({ node }: DeviceFormProps) {
  const { updateNodeData, deleteNode } = useCanvasStore()
  const { setDirty } = useProjectStore()
  const data = node.data

  const update = (field: keyof DeviceData, value: string | number | boolean | undefined) => {
    updateNodeData(node.id, { [field]: value })
    setDirty(true)
  }

  return (
    <div className="space-y-3">
      {/* Device type badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
          {data.deviceType}
        </span>
        <button
          onClick={() => deleteNode(node.id)}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Delete
        </button>
      </div>

      <FormField label="Label">
        <input
          type="text"
          value={data.label || ''}
          onChange={e => update('label', e.target.value)}
          className="form-input"
          placeholder="Display label"
        />
      </FormField>

      <FormField label="Hostname">
        <input
          type="text"
          value={data.hostname || ''}
          onChange={e => update('hostname', e.target.value)}
          className="form-input"
          placeholder="device-hostname"
        />
      </FormField>

      <FormField label="IP Address">
        <input
          type="text"
          value={data.ipAddress || ''}
          onChange={e => update('ipAddress', e.target.value)}
          className="form-input"
          placeholder="192.168.1.1/24"
        />
      </FormField>

      <FormField label="Subnet">
        <input
          type="text"
          value={data.subnet || ''}
          onChange={e => update('subnet', e.target.value)}
          className="form-input"
          placeholder="192.168.1.0/24"
        />
      </FormField>

      <FormField label="Default Gateway">
        <input
          type="text"
          value={data.defaultGateway || ''}
          onChange={e => update('defaultGateway', e.target.value)}
          className="form-input"
          placeholder="192.168.1.1"
        />
      </FormField>

      <FormField label="VLAN ID">
        <input
          type="number"
          value={data.vlanId || ''}
          onChange={e => update('vlanId', e.target.value ? parseInt(e.target.value) : undefined)}
          className="form-input"
          placeholder="10"
          min="1"
          max="4094"
        />
      </FormField>

      {(data.deviceType === 'switch-l3') && (
        <FormField label="Inter-VLAN Routing">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.interVlanRouting || false}
              onChange={e => update('interVlanRouting', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-xs text-gray-300">Enabled</span>
          </label>
        </FormField>
      )}

      <FormField label="Manufacturer">
        <input
          type="text"
          value={data.manufacturer || ''}
          onChange={e => update('manufacturer', e.target.value)}
          className="form-input"
          placeholder="Cisco"
        />
      </FormField>

      <FormField label="Model">
        <input
          type="text"
          value={data.model || ''}
          onChange={e => update('model', e.target.value)}
          className="form-input"
          placeholder="Model number"
        />
      </FormField>

      <FormField label="Role">
        <input
          type="text"
          value={data.role || ''}
          onChange={e => update('role', e.target.value)}
          className="form-input"
          placeholder="e.g. file-server"
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          value={data.notes || ''}
          onChange={e => update('notes', e.target.value)}
          className="form-input resize-none h-16"
          placeholder="Additional notes..."
        />
      </FormField>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.dhcpServer || false}
            onChange={e => update('dhcpServer', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className="text-xs text-gray-400">DHCP Server</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.dnsServer || false}
            onChange={e => update('dnsServer', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className="text-xs text-gray-400">DNS Server</span>
        </label>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )
}
