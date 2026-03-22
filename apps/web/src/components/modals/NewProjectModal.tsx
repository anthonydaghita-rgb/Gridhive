import { useState } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { SYSTEM_TEMPLATES } from '@gridhive/shared'
import type { NetForgeTemplate } from '@gridhive/shared'

export function NewProjectModal() {
  const { closeModal, setActiveModal } = useUiStore()
  const { clearCanvas, loadTopology } = useCanvasStore()
  const [selected, setSelected] = useState<NetForgeTemplate | null>(null)

  const handleBlankCanvas = () => {
    clearCanvas()
    closeModal()
  }

  const handleLoadTemplate = () => {
    if (!selected) return
    loadTopology(selected.topology)
    closeModal()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <p className="text-gray-400 text-sm mt-0.5">Start with a blank canvas or choose a template</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div
            onClick={handleBlankCanvas}
            className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 group"
          >
            <div className="text-3xl mb-2">+</div>
            <p className="text-white font-medium group-hover:text-blue-400">Blank Canvas</p>
            <p className="text-gray-500 text-sm mt-1">Start from scratch</p>
          </div>

          <h3 className="text-sm font-medium text-gray-400 mb-3">System Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {SYSTEM_TEMPLATES.map(template => (
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
                  <div>
                    <p className="text-sm font-medium text-white">{template.meta.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{template.meta.category}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    template.meta.difficulty === 'beginner' ? 'bg-green-900/50 text-green-400' :
                    template.meta.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {template.meta.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{template.meta.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.meta.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3 justify-end">
          <button onClick={closeModal} className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          {selected && (
            <button
              onClick={handleLoadTemplate}
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
