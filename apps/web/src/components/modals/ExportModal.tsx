import { useState } from 'react'
import { FileJson, Table2, FileText, FileDown, X, Loader2, Cpu, Download, AlertTriangle } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useExport } from '../../hooks/useExport'
import { useCanvasStore } from '../../stores/canvasStore'
import { api } from '../../lib/api'
import type { VendorDeviceProfile, ConfigExportResult } from '@gridhive/shared'

export function ExportModal() {
  const { closeModal } = useUiStore()
  const { exportJSON, exportCSV, exportValidationReport, exportPDF, isGeneratingPDF } = useExport()
  const [pdfOptions, setPdfOptions] = useState({
    includeValidation: true,
    includeSimulation: true,
    includeSubnet: true,
    includeLateralMovement: true,
    includeCapacity: true,
    paperSize: 'Letter' as 'Letter' | 'A4',
  })
  const [activeTab, setActiveTab] = useState<'formats' | 'pdf' | 'device-config'>('formats')

  const exports = [
    {
      label: 'Topology JSON',
      description: 'Complete topology as .gridhive.json — can be re-imported later.',
      Icon: FileJson,
      action: exportJSON,
    },
    {
      label: 'Device Inventory CSV',
      description: 'All devices with IP, VLAN, subnet, and other properties.',
      Icon: Table2,
      action: exportCSV,
    },
    {
      label: 'Validation Report',
      description: 'Text report of all validation errors, warnings, and info.',
      Icon: FileText,
      action: exportValidationReport,
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-400" />
            Export
          </h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {(['formats', 'pdf', 'device-config'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'formats' ? 'Formats' : tab === 'pdf' ? 'PDF Report' : 'Device Config'}
            </button>
          ))}
        </div>

        {activeTab === 'formats' && (
          <div className="p-4 space-y-2">
            {exports.map(exp => (
              <button
                key={exp.label}
                onClick={() => { exp.action(); closeModal() }}
                className="w-full flex items-start gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-700 hover:border-gray-600"
              >
                <exp.Icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{exp.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{exp.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-gray-400">
              Generate a full network documentation report including diagrams, device inventory, VLAN reference, and validation results.
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeValidation}
                  onChange={e => setPdfOptions(p => ({ ...p, includeValidation: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Include validation report</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeSimulation}
                  onChange={e => setPdfOptions(p => ({ ...p, includeSimulation: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Include simulation results</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeSubnet}
                  onChange={e => setPdfOptions(p => ({ ...p, includeSubnet: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Include subnet reference</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeLateralMovement}
                  onChange={e => setPdfOptions(p => ({ ...p, includeLateralMovement: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Include lateral movement analysis</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeCapacity}
                  onChange={e => setPdfOptions(p => ({ ...p, includeCapacity: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-300">Include capacity planning analysis</span>
              </label>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Paper Size</label>
                <div className="flex gap-2">
                  {(['Letter', 'A4'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setPdfOptions(p => ({ ...p, paperSize: size }))}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                        pdfOptions.paperSize === size
                          ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => exportPDF(pdfOptions)}
              disabled={isGeneratingPDF}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isGeneratingPDF
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Report...</>
                : <><FileDown className="w-4 h-4" /> Generate Report</>
              }
            </button>
          </div>
        )}

        {activeTab === 'device-config' && <DeviceConfigTab />}

        <div className="p-4 border-t border-gray-800">
          <button onClick={closeModal} className="w-full text-sm text-gray-400 hover:text-white py-2 rounded hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DeviceConfigTab() {
  const { nodes, getTopologySnapshot } = useCanvasStore()
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [allProfiles, setAllProfiles] = useState<VendorDeviceProfile[] | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [result, setResult] = useState<ConfigExportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const networkDevices = nodes.filter(n =>
    !['internet', 'ac-server', 'ac-controller', 'ac-reader', 'ac-door-hardware',
      'ac-intercom', 'ac-biometric', 'ac-key-pad', 'ac-visitor-kiosk',
      'ac-elevator-ctrl', 'ac-turnstile'].includes(n.data.deviceType || '')
  )

  const selectedDevice = nodes.find(n => n.id === selectedDeviceId)
  const profiles = allProfiles
    ? allProfiles.filter(p => !selectedDevice || p.deviceType === selectedDevice.data.deviceType)
    : null

  async function loadProfiles() {
    setLoadingProfiles(true)
    setError(null)
    try {
      const data = await api.get<VendorDeviceProfile[]>('/export/profiles')
      setAllProfiles(data)
    } catch {
      setError('Failed to load device profiles')
    } finally {
      setLoadingProfiles(false)
    }
  }

  async function generateConfig() {
    if (!selectedDeviceId || !selectedProfileId) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.post<ConfigExportResult>('/export/device-config', {
        topology: getTopologySnapshot(),
        deviceId: selectedDeviceId,
        profileId: selectedProfileId,
      })
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Config generation failed')
    } finally {
      setLoading(false)
    }
  }

  function downloadConfig() {
    if (!result) return
    const blob = new Blob([result.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedProfile = allProfiles?.find(p => p.id === selectedProfileId)

  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-gray-400">
        Generate a vendor-specific configuration file for a device on your canvas. Download and apply it directly to the device.
      </p>

      {nodes.length === 0 && (
        <div className="text-xs text-gray-500 bg-gray-800 rounded p-3">
          Add devices to the canvas first.
        </div>
      )}

      {nodes.length > 0 && (
        <>
          {/* Step 1: Select device */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">1. Select Device</label>
            <select
              value={selectedDeviceId}
              onChange={e => { setSelectedDeviceId(e.target.value); setSelectedProfileId(''); setResult(null) }}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">— choose a device —</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.data.label || n.data.hostname || n.id} ({n.data.deviceType})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Load + select profile */}
          {selectedDeviceId && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-400">2. Select Vendor Profile</label>
                {!profiles && (
                  <button
                    onClick={loadProfiles}
                    disabled={loadingProfiles}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {loadingProfiles ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                    Load profiles
                  </button>
                )}
              </div>
              {profiles && profiles.length === 0 && (
                <p className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2">
                  No vendor profiles available for this device type.
                </p>
              )}
              {profiles && profiles.length > 0 && (
                <select
                  value={selectedProfileId}
                  onChange={e => { setSelectedProfileId(e.target.value); setResult(null) }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">— choose a vendor profile —</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.displayName || p.model} — {p.vendor} ({p.configFormat})
                    </option>
                  ))}
                </select>
              )}
              {selectedProfile?.notes && (
                <p className="text-[10px] text-gray-500 mt-1">{selectedProfile.notes}</p>
              )}
            </div>
          )}

          {/* Step 3: Generate */}
          {selectedDeviceId && selectedProfileId && (
            <button
              onClick={generateConfig}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded text-sm font-medium transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Config'}
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.warnings.length > 0 && (
                <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2 space-y-1">
                  {result.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
                </div>
              )}
              {result.instructions && (
                <p className="text-xs text-gray-400 italic">{result.instructions}</p>
              )}
              <div className="bg-gray-950 border border-gray-800 rounded p-3 max-h-40 overflow-y-auto">
                <pre className="text-[10px] text-gray-300 whitespace-pre-wrap font-mono">{result.content.slice(0, 1000)}{result.content.length > 1000 ? '\n...(truncated)' : ''}</pre>
              </div>
              <button
                onClick={downloadConfig}
                className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-2 rounded text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {result.filename}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
