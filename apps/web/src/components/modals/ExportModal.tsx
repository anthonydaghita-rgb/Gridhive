import { useUiStore } from '../../stores/uiStore'
import { useExport } from '../../hooks/useExport'

export function ExportModal() {
  const { closeModal } = useUiStore()
  const { exportJSON, exportCSV, exportValidationReport } = useExport()

  const exports = [
    {
      label: 'Topology JSON',
      description: 'Complete topology as .gridhive.json — can be re-imported later.',
      icon: '📄',
      action: exportJSON,
    },
    {
      label: 'Device Inventory CSV',
      description: 'All devices with IP, VLAN, subnet, and other properties.',
      icon: '📊',
      action: exportCSV,
    },
    {
      label: 'Validation Report',
      description: 'Text report of all validation errors, warnings, and info.',
      icon: '📋',
      action: exportValidationReport,
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Export</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <div className="p-4 space-y-2">
          {exports.map(exp => (
            <button
              key={exp.label}
              onClick={() => { exp.action(); closeModal() }}
              className="w-full flex items-start gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-700 hover:border-gray-600"
            >
              <span className="text-2xl flex-shrink-0">{exp.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{exp.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{exp.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={closeModal} className="w-full text-sm text-gray-400 hover:text-white py-2 rounded hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
