import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Node, Edge, Viewport } from '@xyflow/react'
import type { DeviceData, ConnectionData, TopologySnapshot } from '@gridhive/shared'

type DeviceNode = Node<DeviceData>
type ConnectionEdge = Edge<ConnectionData>

interface CanvasStore {
  nodes: DeviceNode[]
  edges: ConnectionEdge[]
  viewport: Viewport
  selectedNodeId: string | null
  selectedEdgeId: string | null
  fitViewNodeIds: string[] | null

  setNodes: (nodes: DeviceNode[] | ((prev: DeviceNode[]) => DeviceNode[])) => void
  setEdges: (edges: ConnectionEdge[] | ((prev: ConnectionEdge[]) => ConnectionEdge[])) => void
  setViewport: (viewport: Viewport) => void
  setSelectedNode: (id: string | null) => void
  setSelectedEdge: (id: string | null) => void
  setFitViewNodes: (ids: string[]) => void
  clearFitView: () => void

  addNode: (node: DeviceNode) => void
  updateNodeData: (id: string, data: Partial<DeviceData>) => void
  deleteNode: (id: string) => void

  addEdge: (edge: ConnectionEdge) => void
  updateEdgeData: (id: string, data: Partial<ConnectionData>) => void
  deleteEdge: (id: string) => void

  loadTopology: (snapshot: TopologySnapshot) => void
  getTopologySnapshot: () => TopologySnapshot
  clearCanvas: () => void
  captureCanvasThumbnail: () => Promise<string | null>
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedNodeId: null,
    selectedEdgeId: null,
    fitViewNodeIds: null,

    setNodes: (nodes) => set(state => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
    })),

    setEdges: (edges) => set(state => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges,
    })),

    setViewport: (viewport) => set({ viewport }),

    setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
    setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
    setFitViewNodes: (ids) => set({ fitViewNodeIds: ids }),
    clearFitView: () => set({ fitViewNodeIds: null }),

    addNode: (node) => set(state => ({ nodes: [...state.nodes, node] })),

    updateNodeData: (id, data) => set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
    })),

    deleteNode: (id) => set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

    addEdge: (edge) => set(state => ({ edges: [...state.edges, edge] })),

    updateEdgeData: (id, data) => set(state => ({
      edges: state.edges.map(e => e.id === id ? { ...e, data: { ...e.data!, ...data } } : e),
    })),

    deleteEdge: (id) => set(state => ({
      edges: state.edges.filter(e => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    })),

    loadTopology: (snapshot) => set({
      nodes: snapshot.nodes as DeviceNode[],
      edges: snapshot.edges as ConnectionEdge[],
      viewport: snapshot.viewport,
    }),

    getTopologySnapshot: (): TopologySnapshot => {
      const { nodes, edges, viewport } = get()
      return {
        nodes: nodes as unknown as import('@gridhive/shared').DeviceNode[],
        edges: edges as unknown as import('@gridhive/shared').ConnectionEdge[],
        viewport,
        metadata: { gridEnabled: true, snapToGrid: true, theme: 'default' },
      }
    },

    clearCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null }),

    captureCanvasThumbnail: async () => {
      try {
        const el = document.getElementById('gridhive-canvas-capture')
        if (!el) return null
        const { default: html2canvas } = await import('html2canvas')
        const canvas = await html2canvas(el, {
          backgroundColor: '#030712', // gray-950
          scale: 0.5,
          useCORS: true,
          logging: false,
          width: el.clientWidth,
          height: el.clientHeight,
        })
        return canvas.toDataURL('image/jpeg', 0.7)
      } catch {
        return null
      }
    },
  })),
)
