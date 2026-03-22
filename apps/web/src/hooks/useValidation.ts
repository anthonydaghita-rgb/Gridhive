import { useCallback } from 'react'
import { useCanvasStore } from '../stores/canvasStore'
import { useValidationStore } from '../stores/validationStore'
import { api } from '../lib/api'
import type { ValidationResult } from '@gridhive/shared'

export function useValidation() {
  const { getTopologySnapshot } = useCanvasStore()
  const { setValidating, setValidationResults } = useValidationStore()

  const validate = useCallback(async (): Promise<ValidationResult[]> => {
    setValidating(true)
    try {
      const topology = getTopologySnapshot()
      const results = await api.post<ValidationResult[]>('/validate', { topology })
      const resultArray = Array.isArray(results) ? results : []
      setValidationResults(resultArray)
      return resultArray
    } catch (err) {
      console.error('Validation failed:', err)
      return []
    } finally {
      setValidating(false)
    }
  }, [getTopologySnapshot, setValidating, setValidationResults])

  return { validate }
}
