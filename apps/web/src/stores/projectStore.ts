import { create } from 'zustand'
import type { Project, ProjectVersion } from '@gridhive/shared'

interface ProjectStore {
  currentProject: Project | null
  currentVersion: ProjectVersion | null
  isDirty: boolean
  isAutosaving: boolean
  isSaving: boolean
  lastSavedAt: Date | null

  setCurrentProject: (project: Project | null) => void
  setCurrentVersion: (version: ProjectVersion | null) => void
  setDirty: (dirty: boolean) => void
  setAutosaving: (autosaving: boolean) => void
  setSaving: (saving: boolean) => void
  setLastSavedAt: (date: Date) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  currentVersion: null,
  isDirty: false,
  isAutosaving: false,
  isSaving: false,
  lastSavedAt: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setAutosaving: (autosaving) => set({ isAutosaving: autosaving }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date, isDirty: false }),
}))
