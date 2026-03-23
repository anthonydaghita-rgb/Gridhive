import { useState } from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { api } from '../../../lib/api'
import type { ComplianceReport } from '@gridhive/shared'

type SupportedFrameworkId = 'hipaa' | 'nist-csf' | 'cmmc-l2' | 'pci-dss' | 'soc2'

const FRAMEWORKS: { id: SupportedFrameworkId; name: string }[] = [
  { id: 'hipaa', name: 'HIPAA' },
  { id: 'nist-csf', name: 'NIST CSF' },
  { id: 'cmmc-l2', name: 'CMMC 2.0' },
  { id: 'pci-dss', name: 'PCI DSS' },
  { id: 'soc2', name: 'SOC 2' },
]

export function CompliancePanel() {
  const { nodes, edges } = useCanvasStore()
  const [selectedFramework, setSelectedFramework] = useState<SupportedFrameworkId>('nist-csf')
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    violations: true,
    warnings: false,
    passed: false,
  })

  const topology = { nodes, edges }

  async function runCheck() {
    if (nodes.length === 0) {
      setError('Add devices to the canvas before running a compliance check.')
      return
    }
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await api.post<ComplianceReport>('/compliance/run', {
        topology,
        frameworkId: selectedFramework,
      })
      setReport(result)
      setExpandedSections({ violations: true, warnings: result.violations.length === 0, passed: false })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compliance check failed')
    } finally {
      setLoading(false)
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const score = report?.score ?? 0
  const scoreColor = report
    ? score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
    : 'text-gray-400'

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar: framework pills + run button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 flex-shrink-0 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {FRAMEWORKS.map(fw => (
            <button
              key={fw.id}
              onClick={() => { setSelectedFramework(fw.id); setReport(null); setError(null) }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedFramework === fw.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {fw.name}
            </button>
          ))}
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {loading ? 'Running...' : 'Run Check'}
        </button>
      </div>

      {/* Scrollable results area */}
      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!report && !error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <ShieldCheck className="w-8 h-8 mb-2 text-gray-700" />
            <p className="text-sm">Select a framework and click Run Check</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analyzing topology...</span>
          </div>
        )}

        {report && (
          <div className="space-y-3">
            {/* Score bar */}
            <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${scoreColor}`}>{score}%</p>
                <p className="text-[10px] text-gray-500">Score</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-1.5">
                  <span className="text-xs text-red-400">{report.violations.length} violations</span>
                  <span className="text-xs text-yellow-400">{report.warnings.length} warnings</span>
                  <span className="text-xs text-green-400">{report.passed.length} passed</span>
                </div>
              </div>
              <div>
                {report.overallStatus === 'pass' && <ShieldCheck className="w-6 h-6 text-green-400" />}
                {report.overallStatus === 'warnings' && <ShieldAlert className="w-6 h-6 text-yellow-400" />}
                {report.overallStatus === 'fail' && <ShieldAlert className="w-6 h-6 text-red-400" />}
              </div>
            </div>

            {report.violations.length > 0 && (
              <CollapsibleSection
                label={`Violations (${report.violations.length})`}
                color="text-red-400"
                expanded={expandedSections['violations']}
                onToggle={() => toggleSection('violations')}
              >
                {report.violations.map(v => (
                  <FindingRow key={v.id} id={v.id} title={v.title} description={v.description} severity="violation" />
                ))}
              </CollapsibleSection>
            )}

            {report.warnings.length > 0 && (
              <CollapsibleSection
                label={`Warnings (${report.warnings.length})`}
                color="text-yellow-400"
                expanded={expandedSections['warnings']}
                onToggle={() => toggleSection('warnings')}
              >
                {report.warnings.map(v => (
                  <FindingRow key={v.id} id={v.id} title={v.title} description={v.description} severity="warning" />
                ))}
              </CollapsibleSection>
            )}

            {report.passed.length > 0 && (
              <CollapsibleSection
                label={`Passed (${report.passed.length})`}
                color="text-green-400"
                expanded={expandedSections['passed']}
                onToggle={() => toggleSection('passed')}
              >
                {report.passed.map(c => (
                  <FindingRow key={c.id} id={c.id} title={c.title} description={c.description} severity="pass" />
                ))}
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CollapsibleSection({
  label, color, expanded, onToggle, children,
}: {
  label: string
  color: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </button>
      {expanded && <div className="divide-y divide-gray-800/50">{children}</div>}
    </div>
  )
}

function FindingRow({ id, title, description, severity }: {
  id: string
  title: string
  description?: string
  severity: 'violation' | 'warning' | 'pass'
}) {
  const [open, setOpen] = useState(false)
  const Icon = severity === 'violation' ? AlertTriangle : severity === 'warning' ? Info : CheckCircle2
  const iconColor = severity === 'violation' ? 'text-red-400' : severity === 'warning' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-2 text-left"
      >
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-medium">{title}</p>
          <p className="text-[10px] text-gray-500">{id}</p>
        </div>
        {description && (
          open ? <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
        )}
      </button>
      {open && description && (
        <p className="text-[11px] text-gray-400 mt-1.5 pl-5 leading-relaxed">{description}</p>
      )}
    </div>
  )
}
