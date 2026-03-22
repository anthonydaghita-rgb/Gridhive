import { AlertCircle, AlertTriangle, Info, CheckCircle2, XCircle, Loader2, Wrench, X } from 'lucide-react'
import { useValidationStore } from '../../../stores/validationStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import type { ValidationResult } from '@gridhive/shared'

const SEVERITY_CONFIG = {
  error: {
    label: 'Error',
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-800/30',
    Icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-800/30',
    Icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
  info: {
    label: 'Info',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-800/30',
    Icon: Info,
    iconColor: 'text-blue-400',
  },
}

export function ValidationPanel() {
  const {
    validationResults,
    isValidating,
    lastValidatedAt,
    setHighlightedNodes,
    setHighlightedEdges,
    clearHighlights,
    validationNodeStates,
  } = useValidationStore()
  const { setFitViewNodes } = useCanvasStore()

  const errors = validationResults.filter(r => r.severity === 'error')
  const warnings = validationResults.filter(r => r.severity === 'warning')
  const infos = validationResults.filter(r => r.severity === 'info')

  const handleResultClick = (result: ValidationResult) => {
    setHighlightedNodes(result.affectedNodeIds, result.severity)
    setHighlightedEdges(result.affectedEdgeIds)
    if (result.affectedNodeIds.length > 0) {
      setFitViewNodes(result.affectedNodeIds)
    }
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        <span>Running validation...</span>
      </div>
    )
  }

  if (validationResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
        {lastValidatedAt ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span>No issues found</span>
          </>
        ) : (
          <span>Click Validate to check your topology</span>
        )}
      </div>
    )
  }

  const hasHighlights = Object.keys(validationNodeStates || {}).length > 0

  return (
    <div className="p-3 space-y-1">
      {/* Summary bar */}
      <div className="flex items-center gap-3 text-xs mb-3">
        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1 text-yellow-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          </span>
        )}
        {infos.length > 0 && (
          <span className="flex items-center gap-1 text-blue-400">
            <Info className="w-3.5 h-3.5" />
            {infos.length} info
          </span>
        )}
        {hasHighlights && (
          <button
            onClick={clearHighlights}
            className="ml-auto flex items-center gap-1 text-gray-500 hover:text-white text-xs px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Highlights
          </button>
        )}
      </div>

      {validationResults.map(result => {
        const config = SEVERITY_CONFIG[result.severity]
        const { Icon } = config
        return (
          <div
            key={result.id}
            onClick={() => handleResultClick(result)}
            className={`border rounded-lg p-2.5 cursor-pointer hover:opacity-90 transition-opacity ${config.bg}`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${config.color}`}>{result.code}</span>
                </div>
                <p className="text-xs text-white font-medium mt-0.5">{result.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{result.description}</p>
                {result.recommendation && (
                  <div className="flex items-start gap-1 mt-1">
                    <Wrench className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{result.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
