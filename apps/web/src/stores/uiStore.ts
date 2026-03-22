import { create } from 'zustand'

type ActiveModal =
  | 'new-project'
  | 'template-library'
  | 'save-template'
  | 'export'
  | 'version-history'
  | 'save-version'
  | 'project-settings'
  | null

interface UiStore {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  bottomPanelTab: 'validation' | 'simulation'
  activeModal: ActiveModal
  orgLogoBase64: string | null

  setLeftPanel: (open: boolean) => void
  setRightPanel: (open: boolean) => void
  setBottomPanel: (open: boolean) => void
  setBottomPanelTab: (tab: 'validation' | 'simulation') => void
  setActiveModal: (modal: ActiveModal) => void
  closeModal: () => void
  setOrgLogo: (logo: string | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: true,
  bottomPanelTab: 'validation',
  activeModal: null,
  orgLogoBase64: null,

  setLeftPanel: (open) => set({ leftPanelOpen: open }),
  setRightPanel: (open) => set({ rightPanelOpen: open }),
  setBottomPanel: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setOrgLogo: (logo) => set({ orgLogoBase64: logo }),
}))
