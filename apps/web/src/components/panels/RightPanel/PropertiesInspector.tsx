import { MousePointer2 } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { DeviceForm } from './DeviceForm'
import { ConnectionForm } from './ConnectionForm'

export function PropertiesInspector() {
  const { selectedNodeId, selectedEdgeId, nodes, edges } = useCanvasStore()

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
  const selectedEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm mt-8 flex flex-col items-center gap-2">
        <MousePointer2 className="w-6 h-6 text-gray-600" />
        <p>Select a device or connection to view and edit its properties.</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Properties</h2>
      {selectedNode && <DeviceForm node={selectedNode} />}
      {selectedEdge && <ConnectionForm edge={selectedEdge} />}
    </div>
  )
}
