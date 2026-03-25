import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle, XCircle, Circle, Loader2, X, ChevronDown } from 'lucide-react'
import { api } from '../../lib/api'

type TestStatus = 'untested' | 'ok' | 'failed' | 'testing'

type Vendor = 'unifi' | 'meraki' | 'fortigate' | 'panos' | 'aruba'

interface Credential {
  id: string
  vendor: Vendor
  label: string
  testStatus: TestStatus
  lastTestedAt?: string
  createdAt: string
}

const VENDOR_LABELS: Record<Vendor, string> = {
  unifi: 'UniFi',
  meraki: 'Meraki',
  fortigate: 'FortiGate',
  panos: 'PAN-OS',
  aruba: 'Aruba CX',
}

const VENDOR_COLORS: Record<Vendor, string> = {
  unifi: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  meraki: 'bg-green-500/10 text-green-400 border-green-500/20',
  fortigate: 'bg-red-500/10 text-red-400 border-red-500/20',
  panos: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  aruba: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function TestStatusIcon({ status }: { status: TestStatus }) {
  if (status === 'ok') return <CheckCircle className="w-4 h-4 text-green-400" />
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />
  if (status === 'testing') return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
  return <Circle className="w-4 h-4 text-gray-600" />
}

function TestStatusLabel({ status }: { status: TestStatus }) {
  if (status === 'ok') return <span className="text-green-400 text-xs">Connected</span>
  if (status === 'failed') return <span className="text-red-400 text-xs">Failed</span>
  if (status === 'testing') return <span className="text-blue-400 text-xs">Testing...</span>
  return <span className="text-gray-600 text-xs">Not tested</span>
}

interface VendorField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder?: string
}

const VENDOR_FIELDS: Record<Vendor, VendorField[]> = {
  unifi: [
    { key: 'controllerUrl', label: 'Controller URL', type: 'url', placeholder: 'https://192.168.1.1:8443' },
    { key: 'username', label: 'Username', type: 'text', placeholder: 'admin' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '' },
    { key: 'siteName', label: 'Site Name', type: 'text', placeholder: 'default' },
  ],
  meraki: [
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Meraki Dashboard API Key' },
  ],
  fortigate: [
    { key: 'deviceIp', label: 'Device IP', type: 'text', placeholder: '192.168.1.1' },
    { key: 'apiToken', label: 'API Token', type: 'password', placeholder: '' },
  ],
  panos: [
    { key: 'deviceIp', label: 'Device IP', type: 'text', placeholder: '192.168.1.1' },
    { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '' },
  ],
  aruba: [
    { key: 'controllerIp', label: 'Controller IP', type: 'text', placeholder: '192.168.1.1' },
    { key: 'username', label: 'Username', type: 'text', placeholder: 'admin' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '' },
  ],
}

interface AddCredentialFormProps {
  orgId: string
  onCreated: (cred: Credential) => void
  onCancel: () => void
}

function AddCredentialForm({ orgId, onCreated, onCancel }: AddCredentialFormProps) {
  const [vendor, setVendor] = useState<Vendor>('unifi')
  const [label, setLabel] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFieldChange = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!label.trim()) { setError('Label is required'); return }
    setSaving(true)
    setError(null)
    try {
      const cred = await api.post<Credential>(`/orgs/${orgId}/api-credentials`, {
        vendor,
        label: label.trim(),
        credentials: fields,
      })
      onCreated(cred)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message || 'Failed to save credential')
    } finally {
      setSaving(false)
    }
  }

  const vendorFields = VENDOR_FIELDS[vendor]

  return (
    <div className="border border-gray-700 rounded-xl p-5 bg-gray-800/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Add Credential</h4>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Vendor</label>
          <div className="relative">
            <select
              value={vendor}
              onChange={e => { setVendor(e.target.value as Vendor); setFields({}) }}
              className="w-full appearance-none bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500"
            >
              {(Object.keys(VENDOR_LABELS) as Vendor[]).map(v => (
                <option key={v} value={v}>{VENDOR_LABELS[v]}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label</label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Production UniFi"
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Credentials</p>
        {vendorFields.map(field => (
          <div key={field.key}>
            <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
            <input
              type={field.type}
              value={fields[field.key] || ''}
              onChange={e => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
              autoComplete="off"
            />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-600">
        Credentials are encrypted at rest and never returned in plaintext after saving.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Credential
        </button>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export function CredentialManager({ orgId }: { orgId: string }) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<Credential[]>(`/orgs/${orgId}/api-credentials`)
      setCredentials(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreated = (cred: Credential) => {
    setCredentials(prev => [cred, ...prev])
    setShowAdd(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this credential? This cannot be undone.')) return
    try {
      await api.delete(`/api-credentials/${id}`)
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleTest = async (id: string) => {
    setTestingIds(prev => new Set(prev).add(id))
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, testStatus: 'testing' } : c))
    try {
      const result = await api.post<{ success: boolean }>(`/api-credentials/${id}/test`, {})
      setCredentials(prev => prev.map(c =>
        c.id === id ? { ...c, testStatus: result.success ? 'ok' : 'failed', lastTestedAt: new Date().toISOString() } : c
      ))
    } catch {
      setCredentials(prev => prev.map(c =>
        c.id === id ? { ...c, testStatus: 'failed', lastTestedAt: new Date().toISOString() } : c
      ))
    } finally {
      setTestingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  // Group by vendor
  const byVendor = credentials.reduce<Record<string, Credential[]>>((acc, c) => {
    if (!acc[c.vendor]) acc[c.vendor] = []
    acc[c.vendor].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Device Credentials</h3>
          <p className="text-xs text-gray-500 mt-0.5">Stored encrypted — used for live device API push</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Credential
        </button>
      </div>

      {showAdd && (
        <AddCredentialForm
          orgId={orgId}
          onCreated={handleCreated}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-sm">No credentials saved yet.</p>
          <p className="text-xs mt-1">Add vendor credentials to enable live device push.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.keys(byVendor) as Vendor[]).map(vendor => (
            <div key={vendor}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${VENDOR_COLORS[vendor] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                  {VENDOR_LABELS[vendor] || vendor}
                </span>
                <span className="text-xs text-gray-600">{byVendor[vendor].length} credential{byVendor[vendor].length !== 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-2">
                {byVendor[vendor].map(cred => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <TestStatusIcon status={cred.testStatus} />
                      <div>
                        <p className="text-sm text-white font-medium">{cred.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <TestStatusLabel status={cred.testStatus} />
                          {cred.lastTestedAt && (
                            <span className="text-[10px] text-gray-600">
                              · {new Date(cred.lastTestedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(cred.id)}
                        disabled={testingIds.has(cred.id)}
                        className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded border border-gray-700 hover:border-gray-500 disabled:opacity-50 transition-colors"
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                        title="Remove credential"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
