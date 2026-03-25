import { useState, useEffect, useCallback } from 'react'
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../lib/api'

interface AuditEntry {
  id: string
  userId: string
  action: string
  entityType: string
  entityId?: string
  createdAt: string
  ipAddress?: string
  user?: { name: string; email: string }
  project?: { name: string } | null
}

export function AuditLogViewer({ orgId }: { orgId: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const PAGE_SIZE = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(search && { search }),
        ...(filterAction && { action: filterAction }),
      })
      const res = await api.get<{ entries: AuditEntry[]; total: number }>(
        `/orgs/${orgId}/audit-logs?${params}`
      )
      setEntries(res.entries || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [orgId, page, search, filterAction])

  useEffect(() => { load() }, [load])

  const exportCsv = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'IP']
    const rows = entries.map(e => [
      new Date(e.createdAt).toISOString(),
      e.user?.email || e.userId,
      e.action,
      `${e.entityType}${e.entityId ? ':' + e.entityId : ''}`,
      e.ipAddress || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Audit Log</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search logs..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1) }}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Actions</option>
          <option value="project.created">Project Created</option>
          <option value="project.deleted">Project Deleted</option>
          <option value="project.exported">Config Exported</option>
          <option value="user.login">User Login</option>
          <option value="compliance.run">Compliance Run</option>
          <option value="validation.run">Validation Run</option>
          <option value="scout.complete">Scout Complete</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Timestamp</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">User</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Action</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Entity</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No audit entries found</td></tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-white text-xs">{entry.user?.name || entry.userId.slice(0, 8)}</span>
                    {entry.user?.email && (
                      <p className="text-gray-500 text-[10px]">{entry.user.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">
                    {entry.entityType}{entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ''}
                    {entry.project && <span className="text-gray-500"> ({entry.project.name})</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{entry.ipAddress || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{total} entries total</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
