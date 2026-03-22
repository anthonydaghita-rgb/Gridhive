import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { API_BASE } from '../lib/api'

interface UploadResult {
  success: boolean
  applied?: string
  error?: string
  details?: unknown
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export function AdminPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [status, setStatus] = useState<UploadStatus>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setResult({ success: false, error: 'Only .json files are accepted' })
      setStatus('error')
      return
    }

    setStatus('uploading')
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, error: data.error, details: data.details })
        setStatus('error')
      } else {
        setResult(data)
        setStatus('success')
        setSelectedFile(null)
      }
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : 'Network error' })
      setStatus('error')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatus('idle')
      setResult(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatus('idle')
      setResult(null)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Dashboard
          </button>
          <h1 className="text-xl font-bold text-blue-400">Gridhive Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-2">Update Channel</h2>
        <p className="text-gray-400 text-sm mb-8">
          Upload a JSON config file to update templates, validation rules, or sim suites
          in the running app — no restart required.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${dragging ? 'border-blue-400 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'}`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="text-4xl mb-3">📁</div>
          {selectedFile ? (
            <p className="text-sm font-medium text-blue-300">{selectedFile.name}</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium">Drop a .json file here</p>
              <p className="text-gray-500 text-sm mt-1">or click to browse</p>
            </>
          )}
        </div>

        {/* Upload button */}
        {selectedFile && status !== 'uploading' && (
          <button
            onClick={() => uploadFile(selectedFile)}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Apply Config
          </button>
        )}

        {status === 'uploading' && (
          <div className="mt-4 w-full bg-gray-800 text-gray-400 py-2.5 rounded-lg font-medium text-center">
            Applying...
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${
            result.success
              ? 'bg-green-950/50 border border-green-700 text-green-300'
              : 'bg-red-950/50 border border-red-700 text-red-300'
          }`}>
            {result.success ? (
              <p>✓ {result.applied}</p>
            ) : (
              <>
                <p className="font-medium">✗ {result.error}</p>
                {result.details && (
                  <pre className="mt-2 text-xs text-red-400 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}

        {/* Schema reference */}
        <div className="mt-10 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4 text-gray-200">Supported Payload Types</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <p className="text-gray-300 font-medium mb-1">template</p>
              <p>Add or update a topology template by slug.</p>
              <code className="block mt-1 text-xs bg-gray-900 rounded p-2 text-blue-300">
                {'{ "type": "template", "slug": "my-net", "name": "...", "category": "...", "topology": {...}, "simTestSuite": [] }'}
              </code>
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-1">validation-config</p>
              <p>Enable/disable or re-severity validation rules.</p>
              <code className="block mt-1 text-xs bg-gray-900 rounded p-2 text-blue-300">
                {'{ "type": "validation-config", "rules": { "IP_CONFLICT": { "enabled": false } } }'}
              </code>
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-1">sim-suite</p>
              <p>Append simulation tests to an existing template.</p>
              <code className="block mt-1 text-xs bg-gray-900 rounded p-2 text-blue-300">
                {'{ "type": "sim-suite", "templateSlug": "star-office", "tests": [...] }'}
              </code>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
