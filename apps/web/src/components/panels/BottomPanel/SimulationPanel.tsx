import { useState } from 'react'
import { useValidationStore } from '../../../stores/validationStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { api } from '../../../lib/api'
import type { SimulationTest, SimulationResult } from '@gridhive/shared'
import { SimTestBuilder } from './SimTestBuilder'

export function SimulationPanel() {
  const { simulationResults, isSimulating, setSimulating, setSimulationResults } = useValidationStore()
  const { getTopologySnapshot, nodes } = useCanvasStore()
  const [tests, setTests] = useState<SimulationTest[]>([])
  const [showBuilder, setShowBuilder] = useState(false)

  const runSimulation = async () => {
    if (tests.length === 0) return
    setSimulating(true)
    try {
      const topology = getTopologySnapshot()
      const results = await api.post<SimulationResult[]>('/simulate', { topology, tests })
      setSimulationResults(Array.isArray(results) ? results : [])
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

  if (isSimulating) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Running simulation...
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded border border-gray-700 transition-colors"
        >
          + Add Test
        </button>
        {tests.length > 0 && (
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
          >
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
          return (
            <div key={test.id} className="bg-gray-800 rounded-lg p-2.5 border border-gray-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {result && (
                      <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.passed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    )}
                    <span className="text-xs font-medium text-white truncate">{test.name}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-900 px-1 rounded">{test.type}</span>
                  </div>

                  {result && (
                    <div className="mt-1.5">
                      {result.path.length > 0 && (
                        <div className="text-[10px] text-gray-400">
                          Path: {result.path.map(h => h.nodeLabel).join(' → ')}
                        </div>
                      )}
                      {result.blockReason && (
                        <div className="text-[10px] text-red-400 mt-0.5">{result.blockReason}</div>
                      )}
                      {result.warnings.map((w, i) => (
                        <div key={i} className="text-[10px] text-yellow-400 mt-0.5">{w}</div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeTest(test.id)}
                  className="text-gray-600 hover:text-red-400 text-xs flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
