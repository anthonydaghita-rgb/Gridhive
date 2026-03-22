import { useState } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { SYSTEM_TEMPLATES } from '@gridhive/shared'
import type { NetForgeTemplate, TemplateCategory } from '@gridhive/shared'

const CATEGORIES: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'office-it', label: 'Office IT' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'iot', label: 'IoT' },
  { value: 'campus-enterprise', label: 'Campus' },
  { value: 'multi-site', label: 'Multi-Site' },
  { value: 'hybrid-cloud', label: 'Hybrid Cloud' },
]

export function TemplateLibraryModal() {
  const { closeModal } = useUiStore()
  const { loadTopology } = useCanvasStore()
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const [selected, setSelected] = useState<NetForgeTemplate | null>(null)

  const filtered = SYSTEM_TEMPLATES.filter(t =>
    activeCategory === 'all' || t.meta.category === activeCategory
  )

  const handleLoad = () => {
    if (!selected) return
    loadTopology(selected.topology)
    closeModal()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Template Library</h2>
            <p className="text-gray-400 text-sm">Pre-built network topologies</p>
          </div>
          <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 p-4 border-b border-gray-800 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
                activeCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(template => (
              <div
                key={template.id}
                onClick={() => setSelected(selected?.id === template.id ? null : template)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === template.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-white">{template.meta.name}</p>
                  <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded ml-2 ${
                    template.meta.difficulty === 'beginner' ? 'bg-green-900/50 text-green-400' :
                    template.meta.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {template.meta.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.meta.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {template.meta.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-600">{template.meta.deviceCount} devices</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={closeModal} className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Close
          </button>
          {selected && (
            <button
              onClick={handleLoad}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Load "{selected.meta.name}"
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
