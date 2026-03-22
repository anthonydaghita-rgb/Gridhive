import { useState, useEffect } from 'react'
import { Clock, RotateCcw, Eye, X, Loader2, Tag, Zap } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'
import type { TopologySnapshot } from '@gridhive/shared'

interface VersionEntry {
  id: string
  versionNumber: number
  label?: string
  createdAt: string
  isAutosave: boolean
  createdBy: string
  creator?: { name: string }
  thumbnailBase64?: string
}

export function VersionHistoryModal() {
  const { closeModal } = useUiStore()
  const { currentProject, currentVersion } = useProjectStore()
  const { loadTopology } = useCanvasStore()
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    if (!currentProject) return
    api.get<{ data: VersionEntry[] }>(`/projects/${currentProject.id}/versions`)
      .then(res => setVersions(Array.isArray(res) ? res : (res as { data: VersionEntry[] }).data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentProject])

  const handleRestore = async (version: VersionEntry) => {
    if (!currentProject) return
    setRestoring(version.id)
    try {
      const result = await api.put<{ data: { topology: TopologySnapshot } }>(
        `/projects/${currentProject.id}/versions/${version.id}/restore`,
        {}
      )
      // Get the topology from the original version to load it
      // We need to fetch the full version data
      const fullVersion = await api.get<{ data: { topology: TopologySnapshot } }>(
        `/projects/${currentProject.id}/versions`
      )
      // Load the topology - we'll use the restored snapshot from the original version
      // For now, close and navigate user to reload
      closeModal()
      window.location.reload()
    } catch (err) {
      console.error('Restore failed:', err)
    } finally {
      setRestoring(null)
      setConfirming(null)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Version History
          </h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No versions saved yet
            </div>
          ) : (
            versions.map(version => {
              const isCurrent = currentVersion?.id === version.id
              const isConfirming = confirming === version.id
              const isRestoring = restoring === version.id

              return (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {version.isAutosave
                          ? <Zap className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          : <Tag className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        }
                        <span className={`text-sm font-medium truncate ${version.isAutosave ? 'text-gray-400' : 'text-white'}`}>
                          {version.label || (version.isAutosave ? `Autosave` : `Version ${version.versionNumber}`)}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded flex-shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">v{version.versionNumber}</span>
                        <span className="text-[10px] text-gray-600">·</span>
                        <span className="text-[10px] text-gray-500">{formatTime(version.createdAt)}</span>
                        {version.creator?.name && (
                          <>
                            <span className="text-[10px] text-gray-600">·</span>
                            <span className="text-[10px] text-gray-500">{version.creator.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!isCurrent && (
                      <div>
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRestore(version)}
                              disabled={!!restoring}
                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {isRestoring ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirming(null)}
                              className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirming(version.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isConfirming && (
                    <p className="text-[11px] text-amber-400 mt-2">
                      This will restore the project to this version. Your current unsaved changes will be lost.
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <button onClick={closeModal} className="w-full text-sm text-gray-400 hover:text-white py-2 rounded hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
