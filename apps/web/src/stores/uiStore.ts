import { create } from 'zustand'

type ActiveModal =
  | 'new-project'
  | 'template-library'
  | 'save-template'
  | 'export'
  | 'version-history'
  | 'save-version'
  | 'project-settings'
  | 'proposal'
  | null

export type BottomPanelTab = 'validation' | 'simulation' | 'compliance' | 'lateral-movement' | 'capacity'

interface UiStore {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  bottomPanelTab: BottomPanelTab
  activeModal: ActiveModal
  orgLogoBase64: string | null
  // Phase 5: canvas overlay modes
  canvasOverlay: 'none' | 'blast-radius' | 'capacity'
  // Phase 5: editor view mode
  editorView: 'topology' | 'rack'

  setLeftPanel: (open: boolean) => void
  setRightPanel: (open: boolean) => void
  setBottomPanel: (open: boolean) => void
  setBottomPanelTab: (tab: BottomPanelTab) => void
  setActiveModal: (modal: ActiveModal) => void
  closeModal: () => void
  setOrgLogo: (logo: string | null) => void
  setCanvasOverlay: (overlay: 'none' | 'blast-radius' | 'capacity') => void
  setEditorView: (view: 'topology' | 'rack') => void
}

export const useUiStore = create<UiStore>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: true,
  bottomPanelTab: 'validation',
  activeModal: null,
  orgLogoBase64: null,
  canvasOverlay: 'none',
  editorView: 'topology',

  setLeftPanel: (open) => set({ leftPanelOpen: open }),
  setRightPanel: (open) => set({ rightPanelOpen: open }),
  setBottomPanel: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setOrgLogo: (logo) => set({ orgLogoBase64: logo }),
  setCanvasOverlay: (overlay) => set({ canvasOverlay: overlay }),
  setEditorView: (view) => set({ editorView: view }),
}))
