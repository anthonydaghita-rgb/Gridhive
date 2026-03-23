import { MousePointer2 } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { DeviceForm } from './DeviceForm'
import { ConnectionForm } from './ConnectionForm'
import { BulkEditForm } from './BulkEditForm'

export function PropertiesInspector() {
  const { selectedNodeId, selectedEdgeId, selectedNodeIds, nodes, edges } = useCanvasStore()

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
  const selectedEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null
  const isMultiSelect = selectedNodeIds.length > 1

  if (!selectedNode && !selectedEdge && !isMultiSelect) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm mt-8 flex flex-col items-center gap-2">
        <MousePointer2 className="w-6 h-6 text-gray-600" />
        <p>Select a device or connection to view and edit its properties.</p>
        <p className="text-xs text-gray-600 mt-1">Hold Shift + drag to select multiple devices.</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Properties</h2>
      {isMultiSelect && <BulkEditForm nodeIds={selectedNodeIds} />}
      {!isMultiSelect && selectedNode && <DeviceForm node={selectedNode} />}
      {!isMultiSelect && selectedEdge && <ConnectionForm edge={selectedEdge} />}
    </div>
  )
}
