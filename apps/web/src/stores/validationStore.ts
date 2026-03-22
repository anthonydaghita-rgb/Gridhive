import { create } from 'zustand'
import type { ValidationResult, SimulationResult } from '@gridhive/shared'

export type NodeHighlightState = 'error' | 'warning' | 'info' | 'path-active' | 'path-blocked' | 'path-success'

interface ValidationStore {
  validationResults: ValidationResult[]
  simulationResults: SimulationResult[]
  isValidating: boolean
  isSimulating: boolean
  lastValidatedAt: Date | null
  lastSimulatedAt: Date | null
  highlightedNodeIds: string[]
  highlightedEdgeIds: string[]
  validationNodeStates: Record<string, NodeHighlightState>
  animatingSimulation: SimulationResult | null
  pathHighlightedNodes: string[]
  pathBlockedNode: string | null

  setValidationResults: (results: ValidationResult[]) => void
  setSimulationResults: (results: SimulationResult[]) => void
  setValidating: (running: boolean) => void
  setSimulating: (running: boolean) => void
  setHighlightedNodes: (ids: string[], severity?: 'error' | 'warning' | 'info') => void
  setHighlightedEdges: (ids: string[]) => void
  clearHighlights: () => void
  clearAll: () => void
  setSimulationAnimation: (result: SimulationResult) => void
  clearSimulationAnimation: () => void
}

export const useValidationStore = create<ValidationStore>((set, get) => ({
  validationResults: [],
  simulationResults: [],
  isValidating: false,
  isSimulating: false,
  lastValidatedAt: null,
  lastSimulatedAt: null,
  highlightedNodeIds: [],
  highlightedEdgeIds: [],
  validationNodeStates: {},
  animatingSimulation: null,
  pathHighlightedNodes: [],
  pathBlockedNode: null,

  setValidationResults: (results) => {
    // Build node states from validation results
    const nodeStates: Record<string, NodeHighlightState> = {}
    // Priority: error > warning > info
    for (const result of results) {
      for (const nodeId of result.affectedNodeIds) {
        const current = nodeStates[nodeId]
        if (!current || (result.severity === 'error') || (result.severity === 'warning' && current === 'info')) {
          nodeStates[nodeId] = result.severity
        }
      }
    }
    set({ validationResults: results, lastValidatedAt: new Date(), validationNodeStates: nodeStates })
  },

  setSimulationResults: (results) => set({ simulationResults: results, lastSimulatedAt: new Date() }),
  setValidating: (running) => set({ isValidating: running }),
  setSimulating: (running) => set({ isSimulating: running }),

  setHighlightedNodes: (ids, severity) => {
    const nodeStates: Record<string, NodeHighlightState> = { ...get().validationNodeStates }
    if (severity) {
      for (const id of ids) nodeStates[id] = severity
    }
    set({ highlightedNodeIds: ids, validationNodeStates: nodeStates })
  },
  setHighlightedEdges: (ids) => set({ highlightedEdgeIds: ids }),

  clearHighlights: () => set({ highlightedNodeIds: [], highlightedEdgeIds: [], validationNodeStates: {} }),

  clearAll: () => set({
    validationResults: [],
    simulationResults: [],
    highlightedNodeIds: [],
    highlightedEdgeIds: [],
    validationNodeStates: {},
    animatingSimulation: null,
    pathHighlightedNodes: [],
    pathBlockedNode: null,
  }),

  setSimulationAnimation: (result) => {
    // Set up animation state
    const pathNodeIds = result.path.map(h => h.nodeId)
    set({
      animatingSimulation: result,
      pathHighlightedNodes: pathNodeIds,
      pathBlockedNode: result.blockedAt || null,
    })
  },

  clearSimulationAnimation: () => set({
    animatingSimulation: null,
    pathHighlightedNodes: [],
    pathBlockedNode: null,
  }),
}))
