import { useEffect } from 'react'
import { TopToolbar } from '../toolbar/TopToolbar'
import { ComponentLibrary } from '../panels/LeftPanel/ComponentLibrary'
import { PropertiesInspector } from '../panels/RightPanel/PropertiesInspector'
import { ValidationPanel } from '../panels/BottomPanel/ValidationPanel'
import { SimulationPanel } from '../panels/BottomPanel/SimulationPanel'
import { GridhiveCanvas } from '../canvas/GridhiveCanvas'
import { NewProjectModal } from '../modals/NewProjectModal'
import { TemplateLibraryModal } from '../modals/TemplateLibraryModal'
import { ExportModal } from '../modals/ExportModal'
import { VersionHistoryModal } from '../modals/VersionHistoryModal'
import { SaveVersionModal } from '../modals/SaveVersionModal'
import { ProjectSettingsModal } from '../modals/ProjectSettingsModal'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { api } from '../../lib/api'

export function AppShell() {
  const { leftPanelOpen, rightPanelOpen, bottomPanelOpen, bottomPanelTab, activeModal, setOrgLogo } = useUiStore()
  const { currentProject } = useProjectStore()

  // Load org logo when project is loaded
  useEffect(() => {
    if (!currentProject?.orgId) return
    api.get<{ logoBase64?: string | null }>(`/orgs/${currentProject.orgId}`)
      .then(org => setOrgLogo(org?.logoBase64 ?? null))
      .catch(() => setOrgLogo(null))
  }, [currentProject?.orgId, setOrgLogo])

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <TopToolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        {leftPanelOpen && (
          <div className="w-64 flex-shrink-0 border-r border-gray-800 overflow-y-auto bg-gray-900">
            <ComponentLibrary />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <GridhiveCanvas />
          </div>

          {/* Bottom Panel */}
          {bottomPanelOpen && (
            <div className="h-64 border-t border-gray-800 bg-gray-900 flex flex-col">
              <div className="flex border-b border-gray-800">
                <BottomPanelTab tab="validation" label="Validation" />
                <BottomPanelTab tab="simulation" label="Simulation" />
              </div>
              <div className="flex-1 overflow-y-auto">
                {bottomPanelTab === 'validation' ? <ValidationPanel /> : <SimulationPanel />}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-72 flex-shrink-0 border-l border-gray-800 overflow-y-auto bg-gray-900">
            <PropertiesInspector />
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'new-project' && <NewProjectModal />}
      {activeModal === 'template-library' && <TemplateLibraryModal />}
      {activeModal === 'export' && <ExportModal />}
      {activeModal === 'version-history' && <VersionHistoryModal />}
      {activeModal === 'save-version' && <SaveVersionModal />}
      {activeModal === 'project-settings' && <ProjectSettingsModal />}
    </div>
  )
}

function BottomPanelTab({ tab, label }: { tab: 'validation' | 'simulation'; label: string }) {
  const { bottomPanelTab, setBottomPanelTab } = useUiStore()
  return (
    <button
      onClick={() => setBottomPanelTab(tab)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        bottomPanelTab === tab
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
