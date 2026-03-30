import { useState, useCallback } from 'react'
import { Skull, ShieldAlert, Shield, Zap, Target, Loader2 } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useUiStore } from '../../../stores/uiStore'
import { api } from '../../../lib/api'
import type { LateralMovementResult, WorstCaseResult } from '@gridhive/shared'
import { toast } from 'sonner'

type Mode = 'blast-radius' | 'worst-case'

function lmsRisk(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'CRITICAL', color: 'text-red-400' }
  if (score >= 55) return { label: 'HIGH', color: 'text-orange-400' }
  if (score >= 35) return { label: 'MODERATE', color: 'text-yellow-400' }
  return { label: 'LOW', color: 'text-green-400' }
}

function tierColor(tier: string): string {
  if (tier === 'primary') return 'text-red-400'
  if (tier === 'secondary') return 'text-orange-400'
  if (tier === 'peripheral') return 'text-yellow-400'
  return 'text-gray-500'
}

export function LateralMovementPanel() {
  const { nodes, getTopologySnapshot, setLmResult } = useCanvasStore()
  const { setCanvasOverlay } = useUiStore()
  const [mode, setMode] = useState<Mode>('blast-radius')
  const [sourceNodeId, setSourceNodeId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [blastResult, setBlastResult] = useState<LateralMovementResult | null>(null)
  const [worstResult, setWorstResult] = useState<WorstCaseResult | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const runBlastRadius = useCallback(async () => {
    if (!sourceNodeId) { toast.error('Select a source device first'); return }
    setLoading(true)
    try {
      const topology = getTopologySnapshot()
      const result = await api.post<LateralMovementResult>('/lm/blast-radius', {
        topology,
        sourceNodeId,
        maxHops: 6,
      })
      setBlastResult(result)
      setLmResult(result)
      setCanvasOverlay('blast-radius')
    } catch (e) {
      toast.error('Simulation failed', { description: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }, [sourceNodeId, getTopologySnapshot, setCanvasOverlay, setLmResult])

  const runWorstCase = useCallback(async () => {
    setLoading(true)
    try {
      const topology = getTopologySnapshot()
      const result = await api.post<WorstCaseResult>('/lm/worst-case', { topology })
      setWorstResult(result)
    } catch (e) {
      toast.error('Simulation failed', { description: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }, [getTopologySnapshot])

  const endpointNodes = nodes.filter(n =>
    !['switch-l2', 'switch-l3', 'router', 'firewall', 'firewall-edge', 'internet', 'patch-panel'].includes(n.type as string)
  )

  return (
    <div className="h-full flex flex-col text-sm p-3 gap-3">
      {/* Mode tabs + controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          {(['blast-radius', 'worst-case'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m ? 'bg-red-900/40 text-red-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'blast-radius' ? 'Blast Radius' : 'Worst Case'}
            </button>
          ))}
        </div>

        {mode === 'blast-radius' && (
          <select
            value={sourceNodeId}
            onChange={e => setSourceNodeId(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-500"
          >
            <option value="">Select compromise origin…</option>
            {endpointNodes.map(n => (
              <option key={n.id} value={n.id}>
                {(n.data as Record<string, unknown>).label as string || n.id}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={mode === 'blast-radius' ? runBlastRadius : runWorstCase}
          disabled={loading}
          className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {loading ? 'Simulating…' : 'Run Simulation'}
        </button>

        {(blastResult || worstResult) && (
          <button
            onClick={() => { setBlastResult(null); setWorstResult(null); setLmResult(null); setCanvasOverlay('none') }}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {mode === 'blast-radius' && blastResult && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-2">
            <SummaryCard
              icon={<Skull className="w-4 h-4" />}
              label="Blast Radius Score"
              value={`${blastResult.blastRadiusScore} / ${Math.min(blastResult.maxPossibleScore, 1000)}`}
              color="text-red-400"
            />
            <SummaryCard
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Critical Assets at Risk"
              value={String(blastResult.criticalAssetsAtRisk.length)}
              color={blastResult.criticalAssetsAtRisk.length > 0 ? 'text-red-400' : 'text-green-400'}
            />
            <SummaryCard
              icon={<Target className="w-4 h-4" />}
              label="Devices Reachable"
              value={`${blastResult.devicesReachable} / ${blastResult.totalDevices}`}
              color="text-orange-400"
            />
            <SummaryCard
              icon={<Shield className="w-4 h-4" />}
              label="LMS Score"
              value={`${blastResult.lmsScore}`}
              color={lmsRisk(blastResult.lmsScore).color}
              sub={lmsRisk(blastResult.lmsScore).label}
            />
          </div>

          {/* Reachable devices table */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Device Reach</p>
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-800/60">
                  <tr>
                    <th className="text-left px-2 py-1.5 text-gray-400">Device</th>
                    <th className="text-left px-2 py-1.5 text-gray-400">Tier</th>
                    <th className="text-right px-2 py-1.5 text-gray-400">Probability</th>
                    <th className="text-right px-2 py-1.5 text-gray-400">Hops</th>
                  </tr>
                </thead>
                <tbody>
                  {blastResult.reachability
                    .filter(r => r.tier !== 'unreachable')
                    .sort((a, b) => b.probability - a.probability)
                    .slice(0, 12)
                    .map(r => {
                      const node = nodes.find(n => n.id === r.nodeId)
                      const label = (node?.data as Record<string, unknown>)?.label as string || r.nodeId
                      return (
                        <tr key={r.nodeId} className="border-t border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-2 py-1 text-gray-200 truncate max-w-[120px]">{label}</td>
                          <td className={`px-2 py-1 font-medium capitalize ${tierColor(r.tier)}`}>{r.tier}</td>
                          <td className="px-2 py-1 text-right text-gray-300">{Math.round(r.probability * 100)}%</td>
                          <td className="px-2 py-1 text-right text-gray-400">{r.hops < 99 ? r.hops : '—'}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remediations */}
          {blastResult.remediations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Top Remediations</p>
              <div className="space-y-1.5">
                {blastResult.remediations.map(r => (
                  <div key={r.rank} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-900/60 text-blue-300 rounded-full text-[10px] flex items-center justify-center font-bold">{r.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 text-xs leading-snug">{r.description}</p>
                        <p className="text-green-400 text-[10px] mt-0.5">
                          Blast radius ↓ {r.blastRadiusPctReduction}% (−{r.blastRadiusReduction} pts)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'worst-case' && worstResult && (
        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-xs text-gray-400">
              Network LMS Score: <span className={`font-bold ${lmsRisk(worstResult.networkLmsScore).color}`}>
                {worstResult.networkLmsScore} — {lmsRisk(worstResult.networkLmsScore).label}
              </span>
            </div>
          </div>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-800/60">
                <tr>
                  <th className="text-left px-2 py-1.5 text-gray-400">Rank</th>
                  <th className="text-left px-2 py-1.5 text-gray-400">Device</th>
                  <th className="text-right px-2 py-1.5 text-gray-400">Blast Score</th>
                  <th className="text-right px-2 py-1.5 text-gray-400">Reachable</th>
                  <th className="text-right px-2 py-1.5 text-gray-400">Critical at Risk</th>
                </tr>
              </thead>
              <tbody>
                {worstResult.entries.slice(0, 15).map(e => {
                  const node = nodes.find(n => n.id === e.nodeId)
                  const label = (node?.data as Record<string, unknown>)?.label as string || e.nodeId
                  return (
                    <tr key={e.nodeId} className="border-t border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-2 py-1 text-gray-500 font-mono">#{e.rank}</td>
                      <td className="px-2 py-1 text-gray-200 truncate max-w-[130px]">{label}</td>
                      <td className="px-2 py-1 text-right text-red-300 font-semibold">{e.blastRadiusScore}</td>
                      <td className="px-2 py-1 text-right text-orange-300">{e.devicesReachable}</td>
                      <td className="px-2 py-1 text-right text-red-400">{e.criticalAssetsAtRisk.length || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!blastResult && !worstResult && !loading && (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
          <div className="text-center">
            <Skull className="w-8 h-8 mx-auto mb-2 text-gray-700" />
            <p>Select a mode and run the simulation</p>
            <p className="mt-1 text-gray-700">Blast Radius: how far can an attacker reach from one device?</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub?: string
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2">
      <div className={`flex items-center gap-1 ${color} mb-1`}>{icon}<span className="text-[10px] font-medium">{label}</span></div>
      <p className={`text-lg font-bold leading-tight ${color}`}>{value}</p>
      {sub && <p className={`text-[10px] ${color} opacity-75`}>{sub}</p>}
    </div>
  )
}
