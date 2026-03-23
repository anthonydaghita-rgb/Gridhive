import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useUiStore } from '../stores/uiStore'
import { useAutoSave } from '../hooks/useAutoSave'
import { api } from '../lib/api'
import type { Project, TopologySnapshot } from '@gridhive/shared'

interface ProjectWithVersion extends Project {
  versions?: Array<{ id: string; versionNumber: number; topology: TopologySnapshot; thumbnailBase64?: string }>
}

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { clearCanvas, loadTopology } = useCanvasStore()
  const { setCurrentProject } = useProjectStore()
  const { setActiveModal } = useUiStore()
  const [loading, setLoading] = useState(!!projectId)

  // Auto-save every 60 seconds when canvas is dirty
  useAutoSave(projectId, 60000)

  useEffect(() => {
    if (!projectId) {
      clearCanvas()
      setCurrentProject(null)
      setActiveModal('new-project')
      return
    }

    setLoading(true)
    api.get<ProjectWithVersion>(`/projects/${projectId}`)
      .then(project => {
        setCurrentProject(project)
        if (project.versions && project.versions.length > 0) {
          loadTopology(project.versions[0].topology)
        } else {
          clearCanvas()
        }
      })
      .catch(err => {
        console.error('Failed to load project:', err)
        clearCanvas()
        setCurrentProject(null)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-sm" style={{ background: '#0d0f12' }}>
        Loading project...
      </div>
    )
  }

  return <AppShell />
}
