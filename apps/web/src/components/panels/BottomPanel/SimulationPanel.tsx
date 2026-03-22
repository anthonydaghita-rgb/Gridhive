import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Play, Plus, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useValidationStore } from '../../../stores/validationStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { api } from '../../../lib/api'
import type { SimulationTest, SimulationResult } from '@gridhive/shared'
import { SimTestBuilder } from './SimTestBuilder'

export function SimulationPanel() {
  const { simulationResults, isSimulating, setSimulating, setSimulationResults, setSimulationAnimation } = useValidationStore()
  const { getTopologySnapshot, nodes } = useCanvasStore()
  const [tests, setTests] = useState<SimulationTest[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const runSimulation = async () => {
    if (tests.length === 0) return
    setSimulating(true)
    try {
      const topology = getTopologySnapshot()
      const results = await api.post<SimulationResult[]>('/simulate', { topology, tests })
      const resultArray = Array.isArray(results) ? results : []
      setSimulationResults(resultArray)

      // Trigger path animation for the first test
      if (resultArray.length > 0) {
        setSimulationAnimation(resultArray[0])
      }

      // Auto-expand failed tests
      const failedIds = new Set(resultArray.filter(r => !r.passed).map(r => r.testId))
      setExpandedResults(failedIds)
    } catch (err) {
      console.error('Simulation failed:', err)
    } finally {
      setSimulating(false)
    }
  }

  const addTest = (test: SimulationTest) => {
    setTests(prev => [...prev, test])
    setShowBuilder(false)
  }

  const removeTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id))
  }

  const getResultForTest = (testId: string) => simulationResults.find(r => r.testId === testId)

  const toggleExpand = (testId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev)
      next.has(testId) ? next.delete(testId) : next.add(testId)
      return next
    })
  }

  if (isSimulating) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        <span>Running simulation tests...</span>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded border border-gray-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Test
        </button>
        {tests.length > 0 && (
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Run {tests.length} Test{tests.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {showBuilder && (
        <SimTestBuilder nodes={nodes} onAdd={addTest} onCancel={() => setShowBuilder(false)} />
      )}

      {tests.length === 0 && !showBuilder && (
        <div className="text-center text-gray-500 text-xs py-4">
          Add simulation tests to verify connectivity, isolation, and more.
        </div>
      )}

      <div className="space-y-2">
        {tests.map(test => {
          const result = getResultForTest(test.id)
          const isExpanded = expandedResults.has(test.id)

          return (
            <div key={test.id} className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {result ? (
                      result.passed
                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-white truncate">{test.name}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-900 px-1 rounded flex-shrink-0">{test.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {result && (
                      <button
                        onClick={() => toggleExpand(test.id)}
                        className="text-gray-500 hover:text-white"
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                    <button
                      onClick={() => removeTest(test.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {result && isExpanded && (
                <div className="px-2.5 pb-2.5 border-t border-gray-700 pt-2">
                  {result.path.length > 0 && (
                    <div className="text-[10px] text-gray-400 mb-1">
                      <span className="text-gray-500">Path: </span>
                      {result.path.map((h, i) => (
                        <span key={i}>
                          <span className={
                            result.blockedAt === h.nodeId
                              ? 'text-red-400 font-medium'
                              : 'text-gray-300'
                          }>{h.nodeLabel}</span>
                          {h.note && <span className="text-gray-600"> ({h.note})</span>}
                          {i < result.path.length - 1 && <span className="text-gray-600"> → </span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {result.blockReason && (
                    <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded bg-red-900/20 border border-red-800/30">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-300">{result.blockReason}</p>
                    </div>
                  )}
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-[10px] text-yellow-400 mt-0.5">{w}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
