import { useState } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'

export function SaveTemplateModal() {
  const { closeModal } = useUiStore()
  const { getTopologySnapshot, nodes } = useCanvasStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const topology = getTopologySnapshot()
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      await api.post('/templates', { name, slug, description, category, topology })
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Save as Template</h2>
          <p className="text-gray-400 text-sm">Save current topology as a reusable template</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Template Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
              placeholder="My Network Template"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-input resize-none h-20"
              placeholder="Describe this template..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
              <option value="custom">Custom</option>
              <option value="office-it">Office IT</option>
              <option value="industrial">Industrial</option>
              <option value="iot">IoT</option>
              <option value="campus-enterprise">Campus Enterprise</option>
              <option value="multi-site">Multi-Site</option>
              <option value="hybrid-cloud">Hybrid Cloud</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={closeModal} className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
