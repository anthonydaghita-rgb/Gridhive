import React, { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
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
import { useValidationStore } from '../../stores/validationStore'
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
import { GenericDeviceNode } from './nodes/GenericDeviceNode'
import { NetworkEdge } from './edges/NetworkEdge'
import { toast } from 'sonner'
import { getDeviceDefaults } from '../../lib/deviceDefaults'
import { validateConnection } from '../../lib/connectionRules'
import type { DeviceType, DeviceData, ConnectionData } from '@gridhive/shared'
import type { Node, Edge } from '@xyflow/react'

const G = GenericDeviceNode

const nodeTypes: NodeTypes = {
  // Phase 1–3 nodes (dedicated components)
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
  // Access control (Phase 1–3)
  'ac-server': G, 'ac-controller': G, 'ac-reader': G, 'ac-door-hardware': G,
  'ac-intercom': G, 'ac-biometric': G, 'ac-key-pad': G, 'ac-visitor-kiosk': G,
  'ac-elevator-ctrl': G, 'ac-turnstile': G,
  // Phase 4 — Network Infrastructure
  'load-balancer': G, 'wan-optimizer': G, 'content-filter': G, 'ddos-scrubber': G,
  'dns-server': G, 'radius-server': G, 'proxy-server': G, 'siem-server': G, 'log-server': G,
  'network-tap': G, 'packet-broker': G,
  // Phase 4 — Wireless and Cellular
  'wireless-controller': G, 'cellular-gateway': G, 'cellular-modem': G,
  'satellite-modem': G, 'lte-router': G, 'sd-wan-appliance': G,
  // Phase 4 — Compute and Virtualization
  'hypervisor': G, 'virtual-machine': G, 'container-host': G,
  'blade-chassis': G, 'blade-server': G, 'server-rack': G, 'thin-client': G, 'gpu-server': G,
  // Phase 4 — Storage
  'san-switch': G, 'tape-library': G, 'backup-appliance': G, 'object-storage': G,
  // Phase 4 — Power and Environmental
  'ups': G, 'pdu': G, 'environmental-sensor': G, 'generator': G, 'cooling-unit': G,
  // Phase 4 — Unified Communications
  'pbx-server': G, 'sbc': G, 'voip-gateway': G, 'video-conference-unit': G,
  // Phase 4 — Industrial OT
  'rtu': G, 'dcs': G, 'sis-controller': G, 'historian-server': G,
  'scada-server': G, 'ied': G, 'protocol-converter': G, 'data-diode': G,
  // Phase 4 — Physical Security additions
  'nvr': G, 'dvr': G, 'video-analytics-server': G, 'license-plate-reader': G,
  'intrusion-panel': G, 'fire-panel-gateway': G,
  // Phase 4 — Smart Building
  'bas-controller': G, 'hvac-controller': G, 'lighting-controller': G,
  'energy-meter': G, 'bacnet-router': G, 'elevator-controller': G,
  // Phase 4 — Healthcare
  'medical-device': G, 'infusion-pump': G, 'patient-monitor': G,
  'emr-server': G, 'pacs-server': G, 'nurse-call-server': G,
  // Phase 4 — Cloud and Internet
  'cloud-aws': G, 'cloud-azure': G, 'cloud-gcp': G, 'cloud-m365': G,
  'cloud-saas': G, 'colocation-fabric': G, 'isp-handoff': G,
}

const edgeTypes: EdgeTypes = {
  'network': NetworkEdge,
}

function Canvas() {
  const {
    nodes, edges, viewport,
    setNodes, setEdges, setViewport,
    setSelectedNode, setSelectedEdge, setSelectedNodeIds,
    addEdge: storeAddEdge, addNode,
    fitViewNodeIds, clearFitView,
  } = useCanvasStore()
  const { setDirty } = useProjectStore()
  const { isValidating, isSimulating } = useValidationStore()
  const { fitView } = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Pan-and-zoom to highlighted nodes when fitViewNodeIds is set
  useEffect(() => {
    if (!fitViewNodeIds || fitViewNodeIds.length === 0) return
    fitView({
      nodes: fitViewNodeIds.map(id => ({ id })),
      padding: 0.4,
      duration: 400,
    })
    clearFitView()
  }, [fitViewNodeIds, fitView, clearFitView])

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    // Validate compatibility between source and target device types
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)
    if (sourceNode && targetNode) {
      const sourceType = (sourceNode.data as DeviceData).deviceType as DeviceType
      const targetType = (targetNode.data as DeviceData).deviceType as DeviceType
      const result = validateConnection(sourceType, targetType)
      if (!result.valid) {
        toast.error('Connection not allowed', {
          description: result.reason,
          duration: 6000,
        })
        return
      }
    }

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
  }, [nodes, storeAddEdge, setDirty])

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
    <div ref={reactFlowWrapper} id="gridhive-canvas-capture" className="w-full h-full relative">
      {/* Dim overlay during validation / simulation */}
      {(isValidating || isSimulating) && (
        <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none transition-opacity duration-300" />
      )}
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
        onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); setSelectedNodeIds([]) }}
        onSelectionChange={({ nodes: selectedNodes }) => {
          if (selectedNodes.length > 1) setSelectedNodeIds(selectedNodes.map(n => n.id))
        }}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
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
