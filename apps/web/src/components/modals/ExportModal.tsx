import { useState } from 'react'
import { FileJson, Table2, FileText, FileDown, X, Loader2 } from 'lucide-react'
import { useUiStore } from '../../stores/uiStore'
import { useExport } from '../../hooks/useExport'

export function ExportModal() {
  const { closeModal } = useUiStore()
  const { exportJSON, exportCSV, exportValidationReport, exportPDF, isGeneratingPDF } = useExport()
  const [pdfOptions, setPdfOptions] = useState({
    includeValidation: true,
    includeSimulation: true,
    includeSubnet: true,
    paperSize: 'Letter' as 'Letter' | 'A4',
  })
  const [activeTab, setActiveTab] = useState<'formats' | 'pdf'>('formats')

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
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
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
          <button
            onClick={() => setActiveTab('formats')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'formats' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Formats
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pdf' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            PDF Report
          </button>
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

        <div className="p-4 border-t border-gray-800">
          <button onClick={closeModal} className="w-full text-sm text-gray-400 hover:text-white py-2 rounded hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
