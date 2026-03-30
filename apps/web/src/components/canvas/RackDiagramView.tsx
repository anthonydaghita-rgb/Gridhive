import { useState, useCallback } from 'react'
import { Server, Monitor, Wifi, Shield, Cpu, HardDrive, ChevronLeft, ChevronRight, Plus, Trash2, Edit2, X } from 'lucide-react'
import { useCanvasStore } from '../../stores/canvasStore'
import type { DeviceData } from '@gridhive/shared'
import type { Node } from '@xyflow/react'

// ── Constants ─────────────────────────────────────────────────────────────────

const RACK_HEIGHT_U = 42
const U_HEIGHT_PX = 22
const RACK_WIDTH_PX = 280

const DEVICE_U_DEFAULTS: Record<string, number> = {
  'server': 2, 'server-rack': 2, 'server-tower': 4,
  'switch-l2': 1, 'switch-l3': 1,
  'router': 1, 'firewall': 2, 'firewall-edge': 2,
  'patch-panel': 1, 'nas': 2, 'ups': 2,
  'workstation': 0, 'laptop': 0, 'voip-phone': 0, 'camera': 0, 'printer': 0,
}

function getUHeight(node: Node<DeviceData>): number {
  const data = node.data as DeviceData & Record<string, unknown>
  if (typeof data.rackUHeight === 'number' && data.rackUHeight > 0) return data.rackUHeight
  return DEVICE_U_DEFAULTS[node.type as string] ?? 1
}

function isRackable(node: Node<DeviceData>): boolean {
  const uH = DEVICE_U_DEFAULTS[node.type as string]
  return uH !== undefined && uH > 0
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RackDef {
  id: string
  name: string
  location?: string
  slots: SlotEntry[]   // ordered list of placed devices
}

interface SlotEntry {
  nodeId: string
  uStart: number // 1-indexed from top
  uHeight: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInitialRacks(nodes: Node<DeviceData>[]): RackDef[] {
  // Group by data.rackId, or put everything in a default rack
  const byRack = new Map<string, Node<DeviceData>[]>()

  for (const node of nodes) {
    if (!isRackable(node)) continue
    const data = node.data as DeviceData & Record<string, unknown>
    const rackId = (data.rackId as string | undefined) ?? 'rack-default'
    if (!byRack.has(rackId)) byRack.set(rackId, [])
    byRack.get(rackId)!.push(node)
  }

  if (byRack.size === 0) {
    return [{ id: 'rack-default', name: 'Main Rack', slots: [] }]
  }

  return Array.from(byRack.entries()).map(([id, nodeList], i) => {
    let cursor = 1
    const slots: SlotEntry[] = []
    for (const node of nodeList) {
      const uH = getUHeight(node)
      if (cursor + uH - 1 <= RACK_HEIGHT_U) {
        slots.push({ nodeId: node.id, uStart: cursor, uHeight: uH })
        cursor += uH
      }
    }
    return { id, name: id === 'rack-default' ? 'Main Rack' : `Rack ${i + 1}`, slots }
  })
}

function deviceIcon(type: string) {
  if (['switch-l2', 'switch-l3'].includes(type)) return <Cpu className="w-3 h-3 flex-shrink-0" />
  if (['router', 'firewall', 'firewall-edge'].includes(type)) return <Shield className="w-3 h-3 flex-shrink-0" />
  if (type === 'wireless-ap') return <Wifi className="w-3 h-3 flex-shrink-0" />
  if (['nas', 'patch-panel', 'ups'].includes(type)) return <HardDrive className="w-3 h-3 flex-shrink-0" />
  if (type === 'workstation') return <Monitor className="w-3 h-3 flex-shrink-0" />
  return <Server className="w-3 h-3 flex-shrink-0" />
}

function deviceColor(type: string): string {
  if (['switch-l2', 'switch-l3'].includes(type)) return 'bg-purple-900/60 border-purple-700/60 text-purple-300'
  if (['router', 'firewall', 'firewall-edge'].includes(type)) return 'bg-red-900/60 border-red-700/60 text-red-300'
  if (type === 'wireless-ap') return 'bg-green-900/60 border-green-700/60 text-green-300'
  if (['nas'].includes(type)) return 'bg-yellow-900/60 border-yellow-700/60 text-yellow-300'
  return 'bg-blue-900/60 border-blue-700/60 text-blue-300'
}

// ── RackUnit row ──────────────────────────────────────────────────────────────

function RackUnit({ u, slot, node, onDrop, onRemove }: {
  u: number
  slot?: SlotEntry
  node?: Node<DeviceData>
  onDrop: (u: number, nodeId: string) => void
  onRemove: (nodeId: string) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const isFirstU = slot ? slot.uStart === u : false

  return (
    <div
      className={`flex border-b border-gray-800/50 transition-colors ${dragOver ? 'bg-blue-900/20' : ''}`}
      style={{ height: U_HEIGHT_PX }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData('nodeId'); if (id) onDrop(u, id) }}
    >
      {/* U number */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-700 border-r border-gray-800/50">
        {u}
      </div>

      {/* Slot content */}
      <div className="flex-1 relative overflow-hidden">
        {slot && isFirstU && node && (
          <div
            className={`absolute inset-0 mx-0.5 my-px flex items-center gap-1.5 px-2 rounded border text-xs font-medium ${deviceColor(node.type as string)}`}
            style={{ height: slot.uHeight * U_HEIGHT_PX - 2 }}
          >
            {deviceIcon(node.type as string)}
            <span className="truncate flex-1">{node.data.label || node.data.hostname || node.id}</span>
            {node.data.ipAddress && <span className="text-[9px] opacity-70 flex-shrink-0">{node.data.ipAddress}</span>}
            <button
              onClick={() => onRemove(node.id)}
              className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Rack column ───────────────────────────────────────────────────────────────

function RackColumn({ rack, nodes, onSlotDrop, onRemoveDevice, onRename, onDelete }: {
  rack: RackDef
  nodes: Node<DeviceData>[]
  onSlotDrop: (rackId: string, u: number, nodeId: string) => void
  onRemoveDevice: (rackId: string, nodeId: string) => void
  onRename: (rackId: string, name: string) => void
  onDelete: (rackId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(rack.name)

  // Build a U→slot lookup
  const uSlotMap = new Map<number, SlotEntry>()
  for (const slot of rack.slots) {
    for (let u = slot.uStart; u < slot.uStart + slot.uHeight; u++) {
      uSlotMap.set(u, slot)
    }
  }

  const totalPower = rack.slots.reduce((sum, slot) => {
    const node = nodes.find(n => n.id === slot.nodeId)
    const data = (node?.data ?? {}) as Record<string, unknown>
    return sum + ((data.rackPowerDraw as number | undefined) ?? 0)
  }, 0)

  return (
    <div className="flex-shrink-0" style={{ width: RACK_WIDTH_PX }}>
      {/* Rack header */}
      <div className="flex items-center justify-between mb-2 px-1">
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={() => { onRename(rack.id, editName); setEditing(false) }}
            onKeyDown={e => e.key === 'Enter' && (onRename(rack.id, editName), setEditing(false))}
            className="flex-1 bg-gray-800 border border-blue-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
          />
        ) : (
          <div className="flex items-center gap-1.5 flex-1">
            <span className="font-semibold text-sm text-gray-200">{rack.name}</span>
            <button onClick={() => setEditing(true)} className="text-gray-600 hover:text-gray-400 transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {totalPower > 0 && <span className="text-[10px] text-yellow-400">{totalPower}W</span>}
          <span className="text-[10px] text-gray-500">{rack.slots.length} devices</span>
          <button onClick={() => onDelete(rack.id)} className="text-gray-700 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Rack frame */}
      <div
        className="border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-950"
        style={{ width: RACK_WIDTH_PX }}
      >
        {/* Top handle */}
        <div className="h-3 bg-gray-800 border-b border-gray-700" />
        {/* Units */}
        <div>
          {Array.from({ length: RACK_HEIGHT_U }, (_, i) => i + 1).map(u => {
            const slot = uSlotMap.get(u)
            const node = slot ? nodes.find(n => n.id === slot.nodeId) : undefined
            return (
              <RackUnit
                key={u}
                u={u}
                slot={slot}
                node={node}
                onDrop={(dropU, nodeId) => onSlotDrop(rack.id, dropU, nodeId)}
                onRemove={nodeId => onRemoveDevice(rack.id, nodeId)}
              />
            )
          })}
        </div>
        {/* Bottom handle */}
        <div className="h-3 bg-gray-800 border-t border-gray-700" />
      </div>
    </div>
  )
}

// ── Device palette ────────────────────────────────────────────────────────────

function DevicePalette({ nodes, placedNodeIds }: { nodes: Node<DeviceData>[]; placedNodeIds: Set<string> }) {
  const unplaced = nodes.filter(n => isRackable(n) && !placedNodeIds.has(n.id))

  return (
    <div className="w-52 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unplaced Devices</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Drag to place in rack</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {unplaced.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-6">All devices placed</p>
        ) : unplaced.map(node => (
          <div
            key={node.id}
            draggable
            onDragStart={e => e.dataTransfer.setData('nodeId', node.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-grab active:cursor-grabbing ${deviceColor(node.type as string)}`}
          >
            {deviceIcon(node.type as string)}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{node.data.label || node.data.hostname || node.id}</p>
              <p className="text-[9px] opacity-70">{node.type} · {getUHeight(node)}U</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function RackDiagramView() {
  const { nodes, updateNodeData } = useCanvasStore()
  const [racks, setRacks] = useState<RackDef[]>(() => buildInitialRacks(nodes as Node<DeviceData>[]))

  const placedNodeIds = new Set(racks.flatMap(r => r.slots.map(s => s.nodeId)))

  const addRack = () => {
    const id = `rack-${Date.now()}`
    setRacks(prev => [...prev, { id, name: `Rack ${prev.length + 1}`, slots: [] }])
  }

  const deleteRack = useCallback((rackId: string) => {
    setRacks(prev => prev.filter(r => r.id !== rackId))
  }, [])

  const renameRack = useCallback((rackId: string, name: string) => {
    setRacks(prev => prev.map(r => r.id === rackId ? { ...r, name } : r))
  }, [])

  const handleSlotDrop = useCallback((rackId: string, u: number, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId) as Node<DeviceData> | undefined
    if (!node) return
    const uH = getUHeight(node)

    setRacks(prev => {
      // Remove from any existing rack
      const next = prev.map(r => ({
        ...r,
        slots: r.slots.filter(s => s.nodeId !== nodeId),
      }))
      // Add to target rack (check for conflicts)
      return next.map(r => {
        if (r.id !== rackId) return r
        const occupied = new Set(r.slots.flatMap(s => Array.from({ length: s.uHeight }, (_, i) => s.uStart + i)))
        const fits = Array.from({ length: uH }, (_, i) => u + i).every(uu => !occupied.has(uu) && uu <= RACK_HEIGHT_U)
        if (!fits) return r
        const newSlots = [...r.slots, { nodeId, uStart: u, uHeight: uH }]
          .sort((a, b) => a.uStart - b.uStart)
        return { ...r, slots: newSlots }
      })
    })

    // Persist rackId to node data
    updateNodeData(nodeId, { rackId, rackSlotStart: u, rackUHeight: uH } as Partial<DeviceData>)
  }, [nodes, updateNodeData])

  const removeDevice = useCallback((rackId: string, nodeId: string) => {
    setRacks(prev => prev.map(r => r.id !== rackId ? r : { ...r, slots: r.slots.filter(s => s.nodeId !== nodeId) }))
    updateNodeData(nodeId, { rackId: undefined } as Partial<DeviceData>)
  }, [updateNodeData])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Device palette */}
      <DevicePalette nodes={nodes as Node<DeviceData>[]} placedNodeIds={placedNodeIds} />

      {/* Rack columns */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
        <div className="flex gap-6 min-h-full">
          {racks.map(rack => (
            <RackColumn
              key={rack.id}
              rack={rack}
              nodes={nodes as Node<DeviceData>[]}
              onSlotDrop={handleSlotDrop}
              onRemoveDevice={removeDevice}
              onRename={renameRack}
              onDelete={deleteRack}
            />
          ))}

          {/* Add rack button */}
          <div className="flex-shrink-0 flex items-start pt-8">
            <button
              onClick={addRack}
              className="flex flex-col items-center justify-center gap-2 w-24 h-40 border-2 border-dashed border-gray-700 rounded-xl text-gray-600 hover:text-gray-400 hover:border-gray-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add Rack</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
