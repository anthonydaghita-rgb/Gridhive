import { useNavigate } from 'react-router-dom'
import { Loader2, PanelLeft, PanelRight, PanelBottom, Download, LayoutTemplate, ShieldCheck, History, Settings, Save } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useValidationStore } from '../../stores/validationStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'

export function TopToolbar() {
  const navigate = useNavigate()
  const { currentProject, isDirty, isSaving, isAutosaving, lastSavedAt, setSaving } = useProjectStore()
  const { setActiveModal, setLeftPanel, leftPanelOpen, rightPanelOpen, setRightPanel, bottomPanelOpen, setBottomPanel, orgLogoBase64 } = useUiStore()
  const { setValidating, setValidationResults, setSimulating, setSimulationResults, isValidating } = useValidationStore()
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
      // Open bottom panel to validation tab
      setBottomPanel(true)
    } catch (err) {
      console.error('Validation failed:', err)
    } finally {
      setValidating(false)
    }
  }

  return (
    <header className="h-12 border-b border-gray-800 bg-gray-900 flex items-center px-3 gap-2 flex-shrink-0">
      {/* Logo / back to dashboard */}
      <button onClick={() => navigate('/')} className="flex items-center mr-2 hover:opacity-80 transition-opacity">
        {orgLogoBase64
          ? <img src={orgLogoBase64} alt="Org logo" className="h-6 max-w-[120px] object-contain" />
          : <span className="text-blue-400 font-bold text-sm">Gridhive</span>
        }
      </button>

      <div className="w-px h-5 bg-gray-700" />

      {/* Project name */}
      <span className="text-gray-300 text-sm font-medium truncate max-w-48">
        {currentProject?.name || 'Untitled Project'}
      </span>

      {/* Save status */}
      <span className={`text-xs ml-1 flex items-center gap-1 ${isDirty ? 'text-yellow-400' : 'text-gray-500'}`}>
        {(isSaving || isAutosaving) && <Loader2 className="w-3 h-3 animate-spin" />}
        {saveStatus}
      </span>

      <div className="flex-1" />

      {/* Panel toggles */}
      <div className="flex gap-1">
        <ToolbarIconButton
          active={leftPanelOpen}
          onClick={() => setLeftPanel(!leftPanelOpen)}
          title="Toggle Device Library"
        >
          <PanelLeft className="w-4 h-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={rightPanelOpen}
          onClick={() => setRightPanel(!rightPanelOpen)}
          title="Toggle Properties"
        >
          <PanelRight className="w-4 h-4" />
        </ToolbarIconButton>
        <ToolbarIconButton
          active={bottomPanelOpen}
          onClick={() => setBottomPanel(!bottomPanelOpen)}
          title="Toggle Validation/Simulation"
        >
          <PanelBottom className="w-4 h-4" />
        </ToolbarIconButton>
      </div>

      <div className="w-px h-5 bg-gray-700" />

      {/* Actions */}
      <button
        onClick={() => setActiveModal('template-library')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
      >
        <LayoutTemplate className="w-3.5 h-3.5" />
        Templates
      </button>

      <button
        onClick={() => setActiveModal('save-version')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        title="Save Version"
      >
        <Save className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setActiveModal('version-history')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        title="Version History"
      >
        <History className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setActiveModal('project-settings')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        title="Project Settings"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleValidate}
        disabled={isValidating}
        className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-3 py-1.5 rounded transition-colors"
      >
        {isValidating
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <ShieldCheck className="w-3.5 h-3.5" />
        }
        {isValidating ? 'Validating...' : 'Validate'}
      </button>

      <button
        onClick={() => setActiveModal('export')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>
    </header>
  )
}

function ToolbarIconButton({ children, active, onClick, title }: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
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
