import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useValidationStore } from '../../stores/validationStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'

export function TopToolbar() {
  const navigate = useNavigate()
  const { currentProject, isDirty, isSaving, isAutosaving, lastSavedAt, setSaving } = useProjectStore()
  const { setActiveModal, setLeftPanel, leftPanelOpen, rightPanelOpen, setRightPanel, bottomPanelOpen, setBottomPanel } = useUiStore()
  const { setValidating, setValidationResults, setSimulating, setSimulationResults } = useValidationStore()
  const { getTopologySnapshot } = useCanvasStore()

  const saveStatus = isSaving || isAutosaving
    ? 'Saving...'
    : isDirty
    ? 'Unsaved changes'
    : lastSavedAt
    ? `Saved ${formatTime(lastSavedAt)}`
    : 'All changes saved'

  const handleValidate = async () => {
    setValidating(true)
    try {
      const topology = getTopologySnapshot()
      const results = await api.post<import('@gridhive/shared').ValidationResult[]>('/validate', { topology })
      setValidationResults(Array.isArray(results) ? results : [])
    } catch (err) {
      console.error('Validation failed:', err)
    } finally {
      setValidating(false)
    }
  }

  return (
    <header className="h-12 border-b border-gray-800 bg-gray-900 flex items-center px-3 gap-2 flex-shrink-0">
      {/* Logo */}
      <button onClick={() => navigate('/')} className="text-blue-400 font-bold text-sm mr-2">
        Gridhive
      </button>

      <div className="w-px h-5 bg-gray-700" />

      {/* Project name */}
      <span className="text-gray-300 text-sm font-medium truncate max-w-48">
        {currentProject?.name || 'Untitled Project'}
      </span>

      {/* Save status */}
      <span className={`text-xs ml-1 ${isDirty ? 'text-yellow-400' : 'text-gray-500'}`}>
        {saveStatus}
      </span>

      <div className="flex-1" />

      {/* Panel toggles */}
      <div className="flex gap-1">
        <ToolbarButton
          active={leftPanelOpen}
          onClick={() => setLeftPanel(!leftPanelOpen)}
          title="Toggle Device Library"
        >
          ☰
        </ToolbarButton>
        <ToolbarButton
          active={rightPanelOpen}
          onClick={() => setRightPanel(!rightPanelOpen)}
          title="Toggle Properties"
        >
          ⊞
        </ToolbarButton>
        <ToolbarButton
          active={bottomPanelOpen}
          onClick={() => setBottomPanel(!bottomPanelOpen)}
          title="Toggle Validation/Simulation"
        >
          ⊟
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-gray-700" />

      {/* Actions */}
      <button
        onClick={() => setActiveModal('template-library')}
        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
      >
        Templates
      </button>

      <button
        onClick={handleValidate}
        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors"
      >
        Validate
      </button>

      <button
        onClick={() => setActiveModal('export')}
        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
      >
        Export
      </button>
    </header>
  )
}

function ToolbarButton({ children, active, onClick, title }: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded text-sm transition-colors ${
        active ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
