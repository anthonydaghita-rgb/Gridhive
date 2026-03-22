import { useEffect } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useUiStore } from '../stores/uiStore'

export function EditorPage() {
  const { clearCanvas } = useCanvasStore()
  const { setCurrentProject, setCurrentVersion } = useProjectStore()
  const { setActiveModal } = useUiStore()

  useEffect(() => {
    // Show new project modal when entering without a project
    setActiveModal('new-project')
  }, [])

  return <AppShell />
}
