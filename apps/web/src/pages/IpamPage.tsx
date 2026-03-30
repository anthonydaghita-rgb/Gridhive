import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Network, Plus, Search, Trash2, ChevronRight, ChevronDown,
  Globe, Server, Wifi, AlertTriangle, BarChart2, ArrowLeft, Loader2, X
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import { GridhiveLogo } from '../components/GridhiveLogo'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Namespace {
  id: string
  orgId: string
  name: string
  description?: string
  subnets?: Array<{ id: string; utilizationPct: number; status: string }>
}

interface Subnet {
  id: string
  namespaceId: string
  cidr: string
  name: string
  supernetId?: string
  vlanId?: number
  vlanName?: string
  gatewayIp?: string
  purpose?: string
  status: string
  utilizationPct: number
  totalHosts: number
  usedHosts: number
}

interface IpAddress {
  id: string
  subnetId: string
  ipAddress: string
  hostname?: string
  macAddress?: string
  deviceType?: string
  status: 'assigned' | 'reserved' | 'available' | 'conflict' | 'stale'
  leaseType: 'static' | 'dhcp' | 'reserved'
  notes?: string
  associatedNodeId?: string
}

interface Org {
  id: string
  name: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  assigned: 'text-green-400 bg-green-900/30',
  reserved: 'text-blue-400 bg-blue-900/30',
  available: 'text-gray-400 bg-gray-800/40',
  conflict: 'text-red-400 bg-red-900/30',
  stale: 'text-yellow-400 bg-yellow-900/30',
}

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-[10px] font-medium ${pct >= 90 ? 'text-red-400' : pct >= 75 ? 'text-orange-400' : 'text-gray-400'}`}>
        {pct}%
      </span>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function IpamPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [selectedNs, setSelectedNs] = useState<Namespace | null>(null)
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null)
  const [addresses, setAddresses] = useState<IpAddress[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IpAddress[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Modals
  const [showNewNs, setShowNewNs] = useState(false)
  const [showNewSubnet, setShowNewSubnet] = useState(false)
  const [showNewAddr, setShowNewAddr] = useState(false)

  // ── Load orgs ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get<{ data: Org[] }>('/orgs').then(res => {
      setOrgs(res.data ?? [])
      if (res.data?.length) setSelectedOrgId(res.data[0].id)
    }).catch(() => {})
  }, [])

  // ── Load namespaces ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedOrgId) return
    setLoading(true)
    api.get<{ data: Namespace[] }>('/ipam/namespaces')
      .then(res => { setNamespaces(res.data ?? []); setSelectedNs(null); setSubnets([]) })
      .catch(e => toast.error('Failed to load namespaces', { description: e.message }))
      .finally(() => setLoading(false))
  }, [selectedOrgId])

  // ── Load subnets ───────────────────────────────────────────────────────────
  const loadSubnets = useCallback(async (ns: Namespace) => {
    setSelectedNs(ns)
    setSelectedSubnet(null)
    setAddresses([])
    setLoading(true)
    try {
      const res = await api.get<{ data: Subnet[] }>(`/ipam/namespaces/${ns.id}/subnets`)
      setSubnets(res.data ?? [])
    } catch (e: unknown) {
      toast.error('Failed to load subnets', { description: e instanceof Error ? e.message : '' })
    } finally { setLoading(false) }
  }, [])

  // ── Load addresses ─────────────────────────────────────────────────────────
  const loadAddresses = useCallback(async (subnet: Subnet) => {
    setSelectedSubnet(subnet)
    setLoading(true)
    try {
      const res = await api.get<{ data: IpAddress[] }>(`/ipam/subnets/${subnet.id}/addresses`)
      setAddresses(res.data ?? [])
    } catch (e: unknown) {
      toast.error('Failed to load addresses', { description: e instanceof Error ? e.message : '' })
    } finally { setLoading(false) }
  }, [])

  // ── Search ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults(null); return }
    const tid = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await api.get<{ data: IpAddress[] }>(`/ipam/search?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(res.data ?? [])
      } catch { setSearchResults([]) }
      finally { setSearchLoading(false) }
    }, 400)
    return () => clearTimeout(tid)
  }, [searchQuery])

  // ── Create namespace ───────────────────────────────────────────────────────
  async function createNamespace(name: string, description: string) {
    if (!selectedOrgId) return
    try {
      await api.post('/ipam/namespaces', { orgId: selectedOrgId, name, description })
      toast.success('Namespace created')
      const res = await api.get<{ data: Namespace[] }>('/ipam/namespaces')
      setNamespaces(res.data ?? [])
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
    setShowNewNs(false)
  }

  // ── Delete namespace ───────────────────────────────────────────────────────
  async function deleteNamespace(id: string) {
    try {
      await api.delete(`/ipam/namespaces/${id}`)
      toast.success('Namespace deleted')
      setNamespaces(prev => prev.filter(n => n.id !== id))
      if (selectedNs?.id === id) { setSelectedNs(null); setSubnets([]) }
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
  }

  // ── Create subnet ──────────────────────────────────────────────────────────
  async function createSubnet(data: Omit<Subnet, 'id' | 'namespaceId' | 'utilizationPct' | 'totalHosts' | 'usedHosts'>) {
    if (!selectedNs) return
    try {
      await api.post(`/ipam/namespaces/${selectedNs.id}/subnets`, data)
      toast.success('Subnet created')
      loadSubnets(selectedNs)
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
    setShowNewSubnet(false)
  }

  // ── Delete subnet ──────────────────────────────────────────────────────────
  async function deleteSubnet(id: string) {
    try {
      await api.delete(`/ipam/subnets/${id}`)
      toast.success('Subnet deleted')
      setSubnets(prev => prev.filter(s => s.id !== id))
      if (selectedSubnet?.id === id) { setSelectedSubnet(null); setAddresses([]) }
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
  }

  // ── Create address ─────────────────────────────────────────────────────────
  async function createAddress(data: Partial<IpAddress>) {
    if (!selectedSubnet) return
    try {
      await api.post('/ipam/addresses', { subnetId: selectedSubnet.id, ...data })
      toast.success('Address allocated')
      loadAddresses(selectedSubnet)
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
    setShowNewAddr(false)
  }

  // ── Delete address ─────────────────────────────────────────────────────────
  async function deleteAddress(id: string) {
    try {
      await api.delete(`/ipam/addresses/${id}`)
      toast.success('Address released')
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (e: unknown) { toast.error('Failed', { description: e instanceof Error ? e.message : '' }) }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <GridhiveLogo className="h-5" />
        <div className="w-px h-4 bg-gray-700" />
        <Network className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-sm">IP Address Management</span>

        {/* Org selector */}
        {orgs.length > 1 && (
          <select
            value={selectedOrgId ?? ''}
            onChange={e => setSelectedOrgId(e.target.value)}
            className="ml-auto text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
          >
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        {/* Global search */}
        <div className="relative ml-auto flex items-center">
          <Search className="absolute left-2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search IP, hostname, MAC…"
            className="bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 w-56 focus:outline-none focus:border-blue-500"
          />
          {searchLoading && <Loader2 className="absolute right-2 w-3 h-3 text-gray-500 animate-spin" />}
          {searchQuery && !searchLoading && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2">
              <X className="w-3 h-3 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Search results overlay */}
      {searchResults !== null && searchQuery.length >= 2 && (
        <div className="mx-4 mt-2 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-10 flex-shrink-0">
          <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</span>
            <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-gray-500 hover:text-white" /></button>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No addresses found</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-800/50">
                <tr>
                  {['IP', 'Hostname', 'MAC', 'Status', 'Namespace'].map(h => (
                    <th key={h} className="text-left px-3 py-1.5 text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.map(a => (
                  <tr key={a.id} className="border-t border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-3 py-1.5 font-mono text-blue-300">{a.ipAddress}</td>
                    <td className="px-3 py-1.5 text-gray-200">{a.hostname || '—'}</td>
                    <td className="px-3 py-1.5 font-mono text-gray-400">{a.macAddress || '—'}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-400">{((((a as unknown as Record<string, unknown>).subnet as Record<string, unknown> | undefined)?.namespace) as Record<string, unknown> | undefined)?.name as string || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Body: three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Col 1: Namespaces */}
        <div className="w-56 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Namespaces</span>
            <button onClick={() => setShowNewNs(true)} className="text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading && !namespaces.length ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-600" /></div>
            ) : namespaces.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No namespaces yet</p>
            ) : namespaces.map(ns => (
              <div key={ns.id}
                onClick={() => loadSubnets(ns)}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  selectedNs?.id === ns.id ? 'bg-blue-900/40 border border-blue-800/60' : 'hover:bg-gray-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-gray-200">{ns.name}</p>
                  <p className="text-[10px] text-gray-500">{ns.subnets?.length ?? 0} subnets</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNamespace(ns.id) }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Subnets */}
        <div className="w-80 flex-shrink-0 border-r border-gray-800 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Subnets {selectedNs ? `— ${selectedNs.name}` : ''}
            </span>
            {selectedNs && (
              <button onClick={() => setShowNewSubnet(true)} className="text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!selectedNs ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs">
                <Globe className="w-8 h-8 mb-2 text-gray-700" />
                Select a namespace
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-600" /></div>
            ) : subnets.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No subnets in this namespace</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-900/80 sticky top-0">
                  <tr>
                    {['CIDR', 'Name', 'VLAN', 'Utilization'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {subnets.map(s => (
                    <tr key={s.id}
                      onClick={() => loadAddresses(s)}
                      className={`border-t border-gray-800/50 cursor-pointer transition-colors ${
                        selectedSubnet?.id === s.id ? 'bg-blue-900/20' : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <td className="px-3 py-2 font-mono text-blue-300 whitespace-nowrap">{s.cidr}</td>
                      <td className="px-3 py-2 text-gray-200 truncate max-w-[80px]">{s.name}</td>
                      <td className="px-3 py-2 text-gray-400">{s.vlanId ? `${s.vlanId}` : '—'}</td>
                      <td className="px-3 py-2"><UtilBar pct={s.utilizationPct} /></td>
                      <td className="px-3 py-2">
                        <button
                          onClick={e => { e.stopPropagation(); deleteSubnet(s.id) }}
                          className="text-gray-700 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Col 3: Addresses */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {selectedSubnet ? `${selectedSubnet.cidr} — ${selectedSubnet.name}` : 'Addresses'}
            </span>
            {selectedSubnet && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500">{selectedSubnet.usedHosts}/{selectedSubnet.totalHosts} used</span>
                <button
                  onClick={() => setShowNewAddr(true)}
                  className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" /> Allocate
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!selectedSubnet ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs">
                <Server className="w-8 h-8 mb-2 text-gray-700" />
                Select a subnet to view addresses
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-600" /></div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-900/80 sticky top-0">
                  <tr>
                    {['IP Address', 'Hostname', 'MAC', 'Type', 'Lease', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {addresses.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-600 py-8">No addresses allocated</td></tr>
                  ) : addresses.map(a => (
                    <tr key={a.id} className="border-t border-gray-800/40 hover:bg-gray-800/20">
                      <td className="px-3 py-2 font-mono text-blue-300">{a.ipAddress}</td>
                      <td className="px-3 py-2 text-gray-200">{a.hostname || '—'}</td>
                      <td className="px-3 py-2 font-mono text-gray-500 text-[10px]">{a.macAddress || '—'}</td>
                      <td className="px-3 py-2 text-gray-400">{a.deviceType || '—'}</td>
                      <td className="px-3 py-2 text-gray-400 capitalize">{a.leaseType}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => deleteAddress(a.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewNs && <NewNamespaceModal onClose={() => setShowNewNs(false)} onCreate={createNamespace} />}
      {showNewSubnet && selectedNs && (
        <NewSubnetModal onClose={() => setShowNewSubnet(false)} onCreate={createSubnet} />
      )}
      {showNewAddr && selectedSubnet && (
        <NewAddressModal subnet={selectedSubnet} onClose={() => setShowNewAddr(false)} onCreate={createAddress} />
      )}
    </div>
  )
}

// ── Modal: New Namespace ───────────────────────────────────────────────────────

function NewNamespaceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string) => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <ModalShell title="New Namespace" onClose={onClose} onSubmit={() => name.trim() && onCreate(name.trim(), desc)}>
      <Field label="Name"><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Production" className={inputCls} /></Field>
      <Field label="Description (optional)"><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this namespace represents" className={inputCls} /></Field>
    </ModalShell>
  )
}

// ── Modal: New Subnet ─────────────────────────────────────────────────────────

function NewSubnetModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: Omit<Subnet, 'id' | 'namespaceId' | 'utilizationPct' | 'totalHosts' | 'usedHosts'>) => void }) {
  const [cidr, setCidr] = useState('')
  const [name, setName] = useState('')
  const [vlanId, setVlanId] = useState('')
  const [gatewayIp, setGatewayIp] = useState('')
  const [purpose, setPurpose] = useState('')
  const [status, setStatus] = useState<Subnet['status']>('active')

  const submit = () => {
    if (!cidr.trim() || !name.trim()) return
    onCreate({ cidr: cidr.trim(), name: name.trim(), vlanId: vlanId ? Number(vlanId) : undefined, gatewayIp: gatewayIp || undefined, purpose: purpose || undefined, status })
  }

  return (
    <ModalShell title="New Subnet" onClose={onClose} onSubmit={submit}>
      <Field label="CIDR"><input autoFocus value={cidr} onChange={e => setCidr(e.target.value)} placeholder="192.168.1.0/24" className={inputCls} /></Field>
      <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Office LAN" className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="VLAN ID"><input type="number" value={vlanId} onChange={e => setVlanId(e.target.value)} placeholder="10" className={inputCls} /></Field>
        <Field label="Gateway IP"><input value={gatewayIp} onChange={e => setGatewayIp(e.target.value)} placeholder="192.168.1.1" className={inputCls} /></Field>
      </div>
      <Field label="Purpose"><input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="End-user workstations" className={inputCls} /></Field>
      <Field label="Status">
        <select value={status} onChange={e => setStatus(e.target.value as Subnet['status'])} className={inputCls}>
          {['active', 'planning', 'reserved', 'deprecated'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
    </ModalShell>
  )
}

// ── Modal: New Address ────────────────────────────────────────────────────────

function NewAddressModal({ subnet, onClose, onCreate }: { subnet: Subnet; onClose: () => void; onCreate: (d: Partial<IpAddress>) => void }) {
  const [ip, setIp] = useState('')
  const [hostname, setHostname] = useState('')
  const [mac, setMac] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [leaseType, setLeaseType] = useState<IpAddress['leaseType']>('static')
  const [status, setStatus] = useState<IpAddress['status']>('assigned')
  const [notes, setNotes] = useState('')

  const submit = () => {
    if (!ip.trim()) return
    onCreate({ ipAddress: ip.trim(), hostname: hostname || undefined, macAddress: mac || undefined, deviceType: deviceType || undefined, leaseType, status, notes: notes || undefined })
  }

  return (
    <ModalShell title={`Allocate address in ${subnet.cidr}`} onClose={onClose} onSubmit={submit}>
      <Field label="IP Address"><input autoFocus value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.10" className={inputCls} /></Field>
      <Field label="Hostname"><input value={hostname} onChange={e => setHostname(e.target.value)} placeholder="workstation-01" className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="MAC Address"><input value={mac} onChange={e => setMac(e.target.value)} placeholder="aa:bb:cc:dd:ee:ff" className={inputCls} /></Field>
        <Field label="Device Type"><input value={deviceType} onChange={e => setDeviceType(e.target.value)} placeholder="workstation" className={inputCls} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lease Type">
          <select value={leaseType} onChange={e => setLeaseType(e.target.value as IpAddress['leaseType'])} className={inputCls}>
            {['static', 'dhcp', 'reserved'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value as IpAddress['status'])} className={inputCls}>
            {['assigned', 'reserved', 'available'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes"><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" className={inputCls} /></Field>
    </ModalShell>
  )
}

// ── Shared modal shell ────────────────────────────────────────────────────────

function ModalShell({ title, onClose, onSubmit, children }: { title: string; onClose: () => void; onSubmit: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white">{title}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
        </div>
        <div className="space-y-3">{children}</div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
          <button onClick={onSubmit} className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg transition-colors">Create</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500'
