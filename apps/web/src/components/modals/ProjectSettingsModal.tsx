import { useState, useEffect } from 'react'
import { Settings, X, Loader2, Trash2 } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { api } from '../../lib/api'

interface Folder {
  id: string
  name: string
  color?: string
}

export function ProjectSettingsModal() {
  const { closeModal } = useUiStore()
  const { currentProject, setCurrentProject } = useProjectStore()
  const [saving, setSaving] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [settings, setSettings] = useState({
    name: currentProject?.name || '',
    description: currentProject?.description || '',
    clientName: '',
    tags: '',
    folderId: null as string | null,
    defaultIpRange: '',
    canvasTheme: 'dark',
    snapToGrid: true,
    gridSize: 20,
  })

  useEffect(() => {
    if (!currentProject) return

    api.get<{ data: typeof settings & { tags: string[] } }>(`/projects/${currentProject.id}/settings`)
      .then(res => {
        const data = (res as { data: typeof settings & { tags: string[] } }).data || res
        if (data) {
          setSettings({
            name: data.name || '',
            description: data.description || '',
            clientName: data.clientName || '',
            tags: (data.tags || []).join(', '),
            folderId: data.folderId || null,
            defaultIpRange: data.defaultIpRange || '',
            canvasTheme: data.canvasTheme || 'dark',
            snapToGrid: data.snapToGrid ?? true,
            gridSize: data.gridSize || 20,
          })
        }
      })
      .catch(console.error)

    // Load folders for the org
    api.get<{ data: Folder[] }>(`/orgs/${currentProject.orgId}/folders`)
      .then(res => setFolders(Array.isArray(res) ? res : (res as { data: Folder[] }).data || []))
      .catch(console.error)
  }, [currentProject])

  const handleSave = async () => {
    if (!currentProject) return
    setSaving(true)
    try {
      await api.put(`/projects/${currentProject.id}/settings`, {
        ...settings,
        tags: settings.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      if (currentProject) {
        setCurrentProject({ ...currentProject, name: settings.name })
      }
      closeModal()
    } catch (err) {
      console.error('Save settings failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Project Settings
          </h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Project Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={settings.description}
              onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
              className="form-input resize-none h-20"
              placeholder="Optional project description"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Client Name</label>
            <input
              type="text"
              value={settings.clientName}
              onChange={e => setSettings(s => ({ ...s, clientName: e.target.value }))}
              className="form-input"
              placeholder="Who this project is for"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={settings.tags}
              onChange={e => setSettings(s => ({ ...s, tags: e.target.value }))}
              className="form-input"
              placeholder="office, industrial, campus"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Folder</label>
            <select
              value={settings.folderId || ''}
              onChange={e => setSettings(s => ({ ...s, folderId: e.target.value || null }))}
              className="form-input"
            >
              <option value="">No folder (unfiled)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Default IP Range</label>
            <input
              type="text"
              value={settings.defaultIpRange}
              onChange={e => setSettings(s => ({ ...s, defaultIpRange: e.target.value }))}
              className="form-input"
              placeholder="192.168.1.0/24"
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Canvas Defaults</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Theme</label>
                <select
                  value={settings.canvasTheme}
                  onChange={e => setSettings(s => ({ ...s, canvasTheme: e.target.value }))}
                  className="form-input"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.snapToGrid}
                  onChange={e => setSettings(s => ({ ...s, snapToGrid: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Snap to Grid</span>
              </label>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Grid Size</label>
                <select
                  value={settings.gridSize}
                  onChange={e => setSettings(s => ({ ...s, gridSize: parseInt(e.target.value) }))}
                  className="form-input"
                >
                  <option value="10">10px</option>
                  <option value="20">20px</option>
                  <option value="40">40px</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Settings
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
