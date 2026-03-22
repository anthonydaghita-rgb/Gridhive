import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { api } from '../lib/api'

export function useAutoSave(projectId: string | undefined, delay = 30000) {
  const { getTopologySnapshot } = useCanvasStore()
  const { isDirty, setAutosaving, setLastSavedAt } = useProjectStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty || !projectId) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setAutosaving(true)
      try {
        const topology = getTopologySnapshot()
        await api.post(`/projects/${projectId}/versions`, {
          topology,
          isAutosave: true,
        })
        setLastSavedAt(new Date())
      } catch (err) {
        console.error('Autosave failed:', err)
      } finally {
        setAutosaving(false)
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, projectId, delay])
}
