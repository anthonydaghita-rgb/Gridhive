import { useValidationStore } from '../../../stores/validationStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import type { ValidationResult } from '@gridhive/shared'

const SEVERITY_CONFIG = {
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/30', dot: 'bg-red-500' },
  warning: { label: 'Warning', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/30', dot: 'bg-yellow-500' },
  info: { label: 'Info', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/30', dot: 'bg-blue-500' },
}

export function ValidationPanel() {
  const { validationResults, isValidating, lastValidatedAt, setHighlightedNodes, setHighlightedEdges, clearHighlights } = useValidationStore()

  const errors = validationResults.filter(r => r.severity === 'error')
  const warnings = validationResults.filter(r => r.severity === 'warning')
  const infos = validationResults.filter(r => r.severity === 'info')

  const handleResultClick = (result: ValidationResult) => {
    setHighlightedNodes(result.affectedNodeIds)
    setHighlightedEdges(result.affectedEdgeIds)
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Running validation...
      </div>
    )
  }

  if (validationResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
        {lastValidatedAt ? (
          <>
            <span className="text-green-400 text-xl">✓</span>
            <span>No issues found</span>
          </>
        ) : (
          <span>Click Validate to check your topology</span>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 space-y-1" onClick={clearHighlights}>
      {/* Summary */}
      <div className="flex gap-3 text-xs mb-3">
        {errors.length > 0 && <span className="text-red-400">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>}
        {warnings.length > 0 && <span className="text-yellow-400">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>}
        {infos.length > 0 && <span className="text-blue-400">{infos.length} info</span>}
      </div>

      {validationResults.map(result => {
        const config = SEVERITY_CONFIG[result.severity]
        return (
          <div
            key={result.id}
            onClick={(e) => { e.stopPropagation(); handleResultClick(result) }}
            className={`border rounded-lg p-2.5 cursor-pointer hover:opacity-90 transition-opacity ${config.bg}`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${config.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${config.color}`}>{result.code}</span>
                </div>
                <p className="text-xs text-white font-medium mt-0.5">{result.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{result.description}</p>
                {result.recommendation && (
                  <p className="text-xs text-gray-500 mt-1 italic">→ {result.recommendation}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
