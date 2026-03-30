import { useState, useCallback } from 'react'
import { Activity, AlertTriangle, Zap, Wifi, ChevronRight, Loader2, Gauge } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useUiStore } from '../../../stores/uiStore'
import { api } from '../../../lib/api'
import type { CapacityResult } from '@gridhive/shared'
import { toast } from 'sonner'

function utilColor(pct: number): string {
  if (pct >= 90) return 'text-red-400'
  if (pct >= 80) return 'text-orange-400'
  if (pct >= 60) return 'text-yellow-400'
  return 'text-green-400'
}

function utilBarColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 80) return 'bg-orange-500'
  if (pct >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

function statusLabel(status: string): { label: string; color: string } {
  if (status === 'critical') return { label: 'CRITICAL', color: 'text-red-400' }
  if (status === 'warning') return { label: 'WARNING', color: 'text-orange-400' }
  if (status === 'watch') return { label: 'WATCH', color: 'text-yellow-400' }
  return { label: 'OK', color: 'text-green-400' }
}

export function CapacityPanel() {
  const { nodes, edges, getTopologySnapshot, setCapacityResult } = useCanvasStore()
  const { setCanvasOverlay } = useUiStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CapacityResult | null>(null)

  const runAnalysis = useCallback(async () => {
    setLoading(true)
    try {
      const topology = getTopologySnapshot()
      const res = await api.post<CapacityResult>('/capacity/calculate', { topology })
      setResult(res)
      setCapacityResult(res)
      setCanvasOverlay('capacity')
    } catch (e) {
      toast.error('Capacity analysis failed', { description: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }, [getTopologySnapshot, setCanvasOverlay, setCapacityResult])

  const clear = () => {
    setResult(null)
    setCapacityResult(null)
    setCanvasOverlay('none')
  }

  const nodesWithProfiles = nodes.filter(n => {
    const data = n.data as Record<string, unknown>
    return data.trafficProfileId || data.trafficProfileAvgMbps
  })

  return (
    <div className="h-full flex flex-col text-sm p-3 gap-3">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs text-gray-500">
          <span className="text-gray-300 font-medium">{nodesWithProfiles.length}</span>
          <span className="ml-1">/ {nodes.length} devices profiled</span>
          <span className="ml-2 text-gray-600">•</span>
          <span className="ml-2 text-gray-300 font-medium">{edges.length}</span>
          <span className="ml-1">links</span>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
          {loading ? 'Analyzing…' : 'Run Capacity Analysis'}
        </button>

        {result && (
          <button onClick={clear} className="text-xs text-gray-500 hover:text-white transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-2">
            <SummaryCard
              icon={<Activity className="w-4 h-4" />}
              label="Total Avg Load"
              value={formatMbps(result.totalBandwidthAvgMbps)}
              color="text-blue-400"
            />
            <SummaryCard
              icon={<Zap className="w-4 h-4" />}
              label="Total Peak Load"
              value={formatMbps(result.totalBandwidthPeakMbps)}
              color="text-orange-400"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Overloaded Links"
              value={String(result.overloadedEdgeIds.length)}
              color={result.overloadedEdgeIds.length > 0 ? 'text-red-400' : 'text-green-400'}
            />
            <SummaryCard
              icon={<Gauge className="w-4 h-4" />}
              label="At-Risk Links"
              value={String(result.atRiskEdgeIds.length)}
              color={result.atRiskEdgeIds.length > 0 ? 'text-orange-400' : 'text-green-400'}
            />
          </div>

          {/* Link utilization table */}
          {result.linkUtilization.filter(l => l.status !== 'ok').length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Link Utilization (non-OK)</p>
              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800/60">
                    <tr>
                      <th className="text-left px-2 py-1.5 text-gray-400">Link</th>
                      <th className="text-right px-2 py-1.5 text-gray-400">Speed</th>
                      <th className="text-right px-2 py-1.5 text-gray-400">Avg</th>
                      <th className="text-right px-2 py-1.5 text-gray-400">Peak</th>
                      <th className="text-left px-2 py-1.5 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.linkUtilization
                      .filter(l => l.status !== 'ok')
                      .sort((a, b) => b.peakUtilizationPct - a.peakUtilizationPct)
                      .slice(0, 10)
                      .map(l => {
                        const srcNode = nodes.find(n => n.id === l.sourceNodeId)
                        const tgtNode = nodes.find(n => n.id === l.targetNodeId)
                        const srcLabel = (srcNode?.data as Record<string, unknown>)?.label as string || l.sourceNodeId
                        const tgtLabel = (tgtNode?.data as Record<string, unknown>)?.label as string || l.targetNodeId
                        const st = statusLabel(l.status)
                        return (
                          <tr key={l.edgeId} className="border-t border-gray-800/50 hover:bg-gray-800/30">
                            <td className="px-2 py-1 text-gray-200 truncate max-w-[200px]">{srcLabel} ↔ {tgtLabel}</td>
                            <td className="px-2 py-1 text-right text-gray-400">{formatMbps(l.linkSpeedMbps)}</td>
                            <td className={`px-2 py-1 text-right font-medium ${utilColor(l.avgUtilizationPct)}`}>{l.avgUtilizationPct}%</td>
                            <td className={`px-2 py-1 text-right font-bold ${utilColor(l.peakUtilizationPct)}`}>{l.peakUtilizationPct}%</td>
                            <td className={`px-2 py-1 text-xs font-medium ${st.color}`}>{st.label}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottlenecks */}
          {result.bottlenecks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bottleneck Recommendations</p>
              <div className="space-y-1.5">
                {result.bottlenecks.map((b, i) => (
                  <div key={b.edgeId} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-900/60 text-orange-300 rounded-full text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold ${utilColor(b.peakUtilizationPct)}`}>{b.peakUtilizationPct}% peak</span>
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${utilBarColor(b.peakUtilizationPct)}`} style={{ width: `${b.peakUtilizationPct}%` }} />
                          </div>
                        </div>
                        <p className="text-gray-200 text-xs leading-snug">{b.description}</p>
                        <p className="text-blue-400 text-[10px] mt-0.5">
                          <ChevronRight className="w-2.5 h-2.5 inline" /> {b.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QoS Requirements */}
          {result.qosRequirements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">QoS Recommendations</p>
              <div className="space-y-1.5">
                {result.qosRequirements.map((q, i) => (
                  <div key={i} className="bg-purple-900/20 border border-purple-800/40 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <Wifi className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-purple-300 text-[10px] font-bold uppercase mb-0.5">{q.trafficType} — {q.priority.toUpperCase()}</p>
                        <p className="text-gray-300 text-xs leading-snug">{q.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.bottlenecks.length === 0 && result.qosRequirements.length === 0 && (
            <div className="text-center text-green-400 text-xs py-4">
              <Activity className="w-6 h-6 mx-auto mb-1" />
              All links within capacity thresholds
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-700" />
            <p>Run capacity analysis to see bandwidth utilization</p>
            <p className="mt-1 text-gray-700">Assign traffic profiles to devices in the Properties panel</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2">
      <div className={`flex items-center gap-1 ${color} mb-1`}>{icon}<span className="text-[10px] font-medium">{label}</span></div>
      <p className={`text-lg font-bold leading-tight ${color}`}>{value}</p>
    </div>
  )
}

function formatMbps(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`
  return `${mbps.toFixed(0)} Mbps`
}
