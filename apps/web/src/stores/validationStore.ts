import { create } from 'zustand'
import type { ValidationResult, SimulationResult } from '@gridhive/shared'

interface ValidationStore {
  validationResults: ValidationResult[]
  simulationResults: SimulationResult[]
  isValidating: boolean
  isSimulating: boolean
  lastValidatedAt: Date | null
  lastSimulatedAt: Date | null
  highlightedNodeIds: string[]
  highlightedEdgeIds: string[]

  setValidationResults: (results: ValidationResult[]) => void
  setSimulationResults: (results: SimulationResult[]) => void
  setValidating: (running: boolean) => void
  setSimulating: (running: boolean) => void
  setHighlightedNodes: (ids: string[]) => void
  setHighlightedEdges: (ids: string[]) => void
  clearHighlights: () => void
  clearAll: () => void
}

export const useValidationStore = create<ValidationStore>((set) => ({
  validationResults: [],
  simulationResults: [],
  isValidating: false,
  isSimulating: false,
  lastValidatedAt: null,
  lastSimulatedAt: null,
  highlightedNodeIds: [],
  highlightedEdgeIds: [],

  setValidationResults: (results) => set({ validationResults: results, lastValidatedAt: new Date() }),
  setSimulationResults: (results) => set({ simulationResults: results, lastSimulatedAt: new Date() }),
  setValidating: (running) => set({ isValidating: running }),
  setSimulating: (running) => set({ isSimulating: running }),
  setHighlightedNodes: (ids) => set({ highlightedNodeIds: ids }),
  setHighlightedEdges: (ids) => set({ highlightedEdgeIds: ids }),
  clearHighlights: () => set({ highlightedNodeIds: [], highlightedEdgeIds: [] }),
  clearAll: () => set({ validationResults: [], simulationResults: [], highlightedNodeIds: [], highlightedEdgeIds: [] }),
}))
