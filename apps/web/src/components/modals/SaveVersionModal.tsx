import { useState } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'

export function SaveVersionModal() {
  const { closeModal } = useUiStore()
  const { currentProject, setSaving, setLastSavedAt } = useProjectStore()
  const { getTopologySnapshot, captureCanvasThumbnail } = useCanvasStore()
  const [label, setLabel] = useState('')
  const [saving, setSavingLocal] = useState(false)

  const now = new Date()
  const defaultLabel = `Save ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  const handleSave = async () => {
    if (!currentProject) return
    setSavingLocal(true)
    setSaving(true)
    try {
      const [topology, thumbnailBase64] = await Promise.all([
        Promise.resolve(getTopologySnapshot()),
        captureCanvasThumbnail(),
      ])
      await api.post(`/projects/${currentProject.id}/versions`, {
        label: label.trim() || defaultLabel,
        topology,
        isAutosave: false,
        thumbnailBase64: thumbnailBase64 ?? undefined,
      })
      setLastSavedAt(new Date())
      closeModal()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSavingLocal(false)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" />
            Save Version
          </h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Version label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="form-input"
              placeholder={defaultLabel}
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Version
          </button>
          <button
            onClick={closeModal}
            className="px-4 text-sm text-gray-400 hover:text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
