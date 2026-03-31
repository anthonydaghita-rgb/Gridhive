import { useCallback, useState } from 'react'
import { useCanvasStore } from '../stores/canvasStore'
import { useValidationStore } from '../stores/validationStore'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import type { ValidationResult } from '@gridhive/shared'
import type { PDFOptions } from '../components/export/PDFGenerator'

export type { PDFOptions }

export function useExport() {
  const { getTopologySnapshot, nodes, lmResult, capacityResult } = useCanvasStore()
  const { validationResults, simulationResults, lastValidatedAt, lastSimulatedAt } = useValidationStore()
  const { currentProject } = useProjectStore()
  const { user } = useAuthStore()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const exportJSON = useCallback(() => {
    const snapshot = getTopologySnapshot()
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    downloadBlob(blob, 'topology.gridhive.json')
  }, [getTopologySnapshot])

  const exportCSV = useCallback(() => {
    const headers = ['Hostname', 'Type', 'IP Address', 'Subnet', 'VLAN', 'Gateway', 'Manufacturer', 'Model', 'Role', 'Notes']
    const rows = nodes.map(node => [
      node.data.hostname,
      node.data.deviceType,
      node.data.ipAddress || '',
      node.data.subnet || '',
      node.data.vlanId?.toString() || '',
      node.data.defaultGateway || '',
      node.data.manufacturer || '',
      node.data.model || '',
      node.data.role || '',
      node.data.notes || '',
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, 'device-inventory.csv')
  }, [nodes])

  const exportValidationReport = useCallback(() => {
    const lines: string[] = [
      'GRIDHIVE VALIDATION REPORT',
      '='.repeat(40),
      `Generated: ${new Date().toLocaleString()}`,
      '',
    ]

    const grouped = {
      error: validationResults.filter(r => r.severity === 'error'),
      warning: validationResults.filter(r => r.severity === 'warning'),
      info: validationResults.filter(r => r.severity === 'info'),
    }

    for (const [severity, results] of Object.entries(grouped)) {
      if (results.length === 0) continue
      lines.push(`${severity.toUpperCase()}S (${results.length})`)
      lines.push('-'.repeat(30))
      for (const r of results as ValidationResult[]) {
        lines.push(`[${r.code}] ${r.title}`)
        lines.push(`  ${r.description}`)
        lines.push(`  -> ${r.recommendation}`)
        lines.push('')
      }
    }

    if (validationResults.length === 0) {
      lines.push('No validation issues found.')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    downloadBlob(blob, 'validation-report.txt')
  }, [validationResults])

  const exportPDF = useCallback(async (options: PDFOptions) => {
    setIsGeneratingPDF(true)
    try {
      const topology = getTopologySnapshot()
      const canvasImageBase64 = await useCanvasStore.getState().captureCanvasHighRes()
      const { generatePDF } = await import('../components/export/PDFGenerator')

      await generatePDF({
        projectName: currentProject?.name || 'Untitled Project',
        orgName: 'Gridhive',
        userName: user?.name || 'Unknown',
        topology,
        validationResults,
        simulationResults,
        simulationTests: [],
        lastValidatedAt,
        lastSimulatedAt,
        canvasImageBase64: canvasImageBase64 ?? undefined,
        lmResult,
        capacityResult,
      }, options)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [getTopologySnapshot, currentProject, user, validationResults, simulationResults, lastValidatedAt, lastSimulatedAt])

  return { exportJSON, exportCSV, exportValidationReport, exportPDF, isGeneratingPDF }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
