import React, { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  type Viewport,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCanvasStore } from '../../stores/canvasStore'
import { useProjectStore } from '../../stores/projectStore'
import { FirewallNode } from './nodes/FirewallNode'
import { SwitchL2Node } from './nodes/SwitchL2Node'
import { SwitchL3Node } from './nodes/SwitchL3Node'
import { RouterNode } from './nodes/RouterNode'
import { ServerNode } from './nodes/ServerNode'
import { WorkstationNode } from './nodes/WorkstationNode'
import { WirelessAPNode } from './nodes/WirelessAPNode'
import { CameraNode } from './nodes/CameraNode'
import { VoIPPhoneNode } from './nodes/VoIPPhoneNode'
import { PrinterNode } from './nodes/PrinterNode'
import { NASNode } from './nodes/NASNode'
import { InternetNode } from './nodes/InternetNode'
import { PLCNode } from './nodes/PLCNode'
import { SensorNode } from './nodes/SensorNode'
import { PatchPanelNode } from './nodes/PatchPanelNode'
import { HMINode } from './nodes/HMINode'
import { NetworkEdge } from './edges/NetworkEdge'
import { getDeviceDefaults } from '../../lib/deviceDefaults'
import type { DeviceType, DeviceData, ConnectionData } from '@gridhive/shared'
import type { Node, Edge } from '@xyflow/react'

const nodeTypes: NodeTypes = {
  'firewall': FirewallNode,
  'firewall-edge': FirewallNode,
  'switch-l2': SwitchL2Node,
  'switch-l3': SwitchL3Node,
  'router': RouterNode,
  'server': ServerNode,
  'workstation': WorkstationNode,
  'wireless-ap': WirelessAPNode,
  'camera': CameraNode,
  'voip-phone': VoIPPhoneNode,
  'printer': PrinterNode,
  'nas': NASNode,
  'internet': InternetNode,
  'plc': PLCNode,
  'sensor': SensorNode,
  'patch-panel': PatchPanelNode,
  'hmi': HMINode,
}

const edgeTypes: EdgeTypes = {
  'network': NetworkEdge,
}

function Canvas() {
  const {
    nodes, edges, viewport,
    setNodes, setEdges, setViewport,
    setSelectedNode, setSelectedEdge,
    addEdge: storeAddEdge, addNode,
  } = useCanvasStore()
  const { setDirty } = useProjectStore()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const newEdge: Edge<ConnectionData> = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'network',
      data: {
        mediaType: 'copper',
        speed: '1G',
        status: 'active',
      },
    }
    storeAddEdge(newEdge as Edge<ConnectionData>)
    setDirty(true)
  }, [storeAddEdge, setDirty])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const deviceType = event.dataTransfer.getData('application/gridhive-device') as DeviceType
    if (!deviceType || !reactFlowWrapper.current) return

    const bounds = reactFlowWrapper.current.getBoundingClientRect()
    const position = {
      x: (event.clientX - bounds.left - viewport.x) / viewport.zoom,
      y: (event.clientY - bounds.top - viewport.y) / viewport.zoom,
    }

    // Snap to grid
    const snapped = {
      x: Math.round(position.x / 20) * 20,
      y: Math.round(position.y / 20) * 20,
    }

    const defaults = getDeviceDefaults(deviceType)
    const newNode: Node<DeviceData> = {
      id: `node-${Date.now()}`,
      type: deviceType,
      position: snapped,
      data: {
        hostname: defaults.hostname || 'New-Device',
        label: defaults.label || deviceType,
        deviceType,
        ...defaults,
      } as DeviceData,
    }

    addNode(newNode as Node<DeviceData>)
    setDirty(true)
  }, [viewport, addNode, setDirty])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes: NodeChange[]) => {
          setNodes((prev) => {
            const next = [...prev]
            for (const change of changes) {
              if (change.type === 'position' && change.position) {
                const idx = next.findIndex(n => n.id === change.id)
                if (idx >= 0) next[idx] = { ...next[idx], position: change.position }
              } else if (change.type === 'remove') {
                const idx = next.findIndex(n => n.id === change.id)
                if (idx >= 0) next.splice(idx, 1)
              }
            }
            return next
          })
          if (changes.some((c: NodeChange) => c.type !== 'select')) setDirty(true)
        }}
        onEdgesChange={(changes: EdgeChange[]) => {
          setEdges((prev) => {
            const next = [...prev]
            for (const change of changes) {
              if (change.type === 'remove') {
                const idx = next.findIndex(e => e.id === change.id)
                if (idx >= 0) next.splice(idx, 1)
              }
            }
            return next
          })
          if (changes.some((c: EdgeChange) => c.type !== 'select')) setDirty(true)
        }}
        onConnect={onConnect}
        onNodeClick={(_: React.MouseEvent, node: Node) => setSelectedNode(node.id)}
        onEdgeClick={(_: React.MouseEvent, edge: Edge) => setSelectedEdge(edge.id)}
        onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null) }}
        onMoveEnd={(_: MouseEvent | TouchEvent | null, vp: Viewport) => setViewport(vp)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[20, 20]}
        defaultViewport={viewport}
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        className="bg-gray-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#374151" />
        <Controls className="!bottom-4 !left-4" />
        <MiniMap
          className="!bottom-4 !right-4 !bg-gray-900 !border-gray-700"
          nodeColor={(node) => getNodeColor(node.type as DeviceType)}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  )
}

function getNodeColor(deviceType: DeviceType): string {
  const colors: Record<string, string> = {
    'firewall': '#ef4444',
    'firewall-edge': '#ef4444',
    'switch-l2': '#3b82f6',
    'switch-l3': '#6366f1',
    'router': '#8b5cf6',
    'server': '#10b981',
    'workstation': '#6b7280',
    'internet': '#f59e0b',
  }
  return colors[deviceType] || '#6b7280'
}

export function GridhiveCanvas() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  )
}
