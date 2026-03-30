import { useEffect } from 'react'
import { TopToolbar } from '../toolbar/TopToolbar'
import { ComponentLibrary } from '../panels/LeftPanel/ComponentLibrary'
import { PropertiesInspector } from '../panels/RightPanel/PropertiesInspector'
import { ValidationPanel } from '../panels/BottomPanel/ValidationPanel'
import { SimulationPanel } from '../panels/BottomPanel/SimulationPanel'
import { CompliancePanel } from '../panels/BottomPanel/CompliancePanel'
import { LateralMovementPanel } from '../panels/BottomPanel/LateralMovementPanel'
import { CapacityPanel } from '../panels/BottomPanel/CapacityPanel'
import { GridhiveCanvas } from '../canvas/GridhiveCanvas'
import { NewProjectModal } from '../modals/NewProjectModal'
import { TemplateLibraryModal } from '../modals/TemplateLibraryModal'
import { ExportModal } from '../modals/ExportModal'
import { VersionHistoryModal } from '../modals/VersionHistoryModal'
import { SaveVersionModal } from '../modals/SaveVersionModal'
import { ProjectSettingsModal } from '../modals/ProjectSettingsModal'
import { useUiStore, type BottomPanelTab } from '../../stores/uiStore'
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
    <div className="h-screen flex flex-col text-white overflow-hidden" style={{ background: '#0d0f12' }}>
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
              <div className="flex border-b border-gray-800 overflow-x-auto">
                <BottomPanelTab tab="validation" label="Validation" />
                <BottomPanelTab tab="simulation" label="Simulation" />
                <BottomPanelTab tab="compliance" label="Compliance" />
                <BottomPanelTab tab="lateral-movement" label="Lateral Movement" />
                <BottomPanelTab tab="capacity" label="Capacity" />
              </div>
              <div className="flex-1 overflow-hidden">
                {bottomPanelTab === 'validation' && <div className="h-full overflow-y-auto"><ValidationPanel /></div>}
                {bottomPanelTab === 'simulation' && <div className="h-full overflow-y-auto"><SimulationPanel /></div>}
                {bottomPanelTab === 'compliance' && <CompliancePanel />}
                {bottomPanelTab === 'lateral-movement' && <LateralMovementPanel />}
                {bottomPanelTab === 'capacity' && <CapacityPanel />}
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

function BottomPanelTab({ tab, label }: { tab: BottomPanelTab; label: string }) {
  const { bottomPanelTab, setBottomPanelTab } = useUiStore()
  return (
    <button
      onClick={() => setBottomPanelTab(tab)}
      className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        bottomPanelTab === tab
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
