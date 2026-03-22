import { useState } from 'react'
import type { Node } from '@xyflow/react'
import type { DeviceData, SimulationTest } from '@gridhive/shared'

interface SimTestBuilderProps {
  nodes: Node<DeviceData>[]
  onAdd: (test: SimulationTest) => void
  onCancel: () => void
}

export function SimTestBuilder({ nodes, onAdd, onCancel }: SimTestBuilderProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<SimulationTest['type']>('reachability')
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [expectedResult, setExpectedResult] = useState<'pass' | 'fail'>('pass')

  const handleAdd = () => {
    if (!name || !sourceId || !targetId) return
    const test: SimulationTest = {
      id: `test-${Date.now()}`,
      name,
      type,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      expectedResult,
    }
    onAdd(test)
  }

  const selectableNodes = nodes.filter(n => n.type !== 'patch-panel')

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-2">
      <h4 className="text-xs font-semibold text-gray-300">New Simulation Test</h4>

      <div>
        <label className="block text-[11px] text-gray-400 mb-0.5">Test Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="form-input text-xs"
          placeholder="e.g. WS-1 can reach Server"
        />
      </div>

      <div>
        <label className="block text-[11px] text-gray-400 mb-0.5">Test Type</label>
        <select value={type} onChange={e => setType(e.target.value as SimulationTest['type'])} className="form-input text-xs">
          <option value="reachability">Reachability</option>
          <option value="isolation">Isolation</option>
          <option value="path-trace">Path Trace</option>
          <option value="internet-access">Internet Access</option>
          <option value="redundancy-failover">Redundancy Failover</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-gray-400 mb-0.5">Source</label>
          <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="form-input text-xs">
            <option value="">Select...</option>
            {selectableNodes.map(n => (
              <option key={n.id} value={n.id}>{n.data.label || n.data.hostname}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-0.5">Target</label>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} className="form-input text-xs">
            <option value="">Select...</option>
            {selectableNodes.map(n => (
              <option key={n.id} value={n.id}>{n.data.label || n.data.hostname}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-gray-400 mb-0.5">Expected Result</label>
        <select value={expectedResult} onChange={e => setExpectedResult(e.target.value as 'pass' | 'fail')} className="form-input text-xs">
          <option value="pass">Pass (traffic flows)</option>
          <option value="fail">Fail (traffic blocked)</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleAdd}
          disabled={!name || !sourceId || !targetId}
          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-1.5 rounded transition-colors"
        >
          Add Test
        </button>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
