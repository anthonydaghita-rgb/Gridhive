import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Folder, FolderPlus, MoreHorizontal, Trash2, Copy, Pencil,
  FolderOpen, AlertCircle, ChevronRight, Settings, LogOut, Shield,
  CheckCircle2, AlertTriangle, HelpCircle, Clock, ChevronDown,
  ArrowUpDown, LayoutGrid, List
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'
import type { Project, Organization } from '@gridhive/shared'
import { GridhiveLogo } from '../components/GridhiveLogo'

interface FolderData {
  id: string
  name: string
  color?: string
  _count?: { projects: number }
}

interface ProjectWithMeta extends Project {
  folder?: { id: string; name: string; color?: string } | null
  creator?: { id: string; name: string }
  versions?: Array<{ thumbnailBase64?: string; versionNumber: number }>
}

const FOLDER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

function relativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return new Date(date).toLocaleDateString()
}

export function DashboardPage() {
  const { user, logout, token } = useAuthStore()
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectWithMeta[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [trashProjects, setTrashProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'unfiled' | 'trash'>('all')
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [contextMenu, setContextMenu] = useState<{ projectId: string; x: number; y: number } | null>(null)
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [createOrgName, setCreateOrgName] = useState('')
  const [createOrgError, setCreateOrgError] = useState('')

  // Redirect to login if user has no session token (e.g. duplicate registration)
  useEffect(() => {
    if (user && !token) {
      logout().finally(() => navigate('/login'))
    }
  }, [user, token, logout, navigate])

  // Load user's orgs on mount — auto-create a personal workspace if none exist
  useEffect(() => {
    if (!user || !token) return
    api.get<Organization[]>('/orgs').then(async orgsList => {
      let list = Array.isArray(orgsList) ? orgsList : []

      if (list.length === 0) {
        // First-time user: create a personal workspace automatically
        const slug = `workspace-${user.id.slice(0, 8).toLowerCase()}`
        try {
          const newOrg = await api.post<Organization>('/orgs', {
            name: `${user.name}'s Workspace`,
            slug,
          })
          list = [newOrg]
        } catch {
          // Auto-create failed — show manual org creation UI
          setShowCreateOrg(true)
          setLoading(false)
          return
        }
      }

      setOrgs(list)
      const stored = localStorage.getItem('gridhive-selected-org')
      const match = stored ? list.find(o => o.id === stored) : null
      if (match) {
        setSelectedOrgId(match.id)
      } else {
        setSelectedOrgId(list[0].id)
        localStorage.setItem('gridhive-selected-org', list[0].id)
      }
    }).catch(() => {
      setShowCreateOrg(true)
      setLoading(false)
    })
  }, [user])

  const handleCreateOrg = async () => {
    if (!user || !createOrgName.trim()) return
    setCreateOrgError('')
    const slug = `workspace-${user.id.slice(0, 8).toLowerCase()}`
    try {
      const newOrg = await api.post<Organization>('/orgs', {
        name: createOrgName.trim(),
        slug,
      })
      const list = [newOrg]
      setOrgs(list)
      setSelectedOrgId(newOrg.id)
      localStorage.setItem('gridhive-selected-org', newOrg.id)
      setShowCreateOrg(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create workspace'
      setCreateOrgError(msg)
    }
  }

  const loadData = useCallback(async () => {
    if (!selectedOrgId) return

    try {
      const [projectsRes, foldersRes] = await Promise.all([
        api.get<ProjectWithMeta[]>(`/orgs/${selectedOrgId}/projects`),
        api.get<FolderData[]>(`/orgs/${selectedOrgId}/folders`),
      ])

      setProjects(Array.isArray(projectsRes) ? projectsRes : [])
      setFolders(Array.isArray(foldersRes) ? foldersRes : [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedOrgId])

  useEffect(() => { loadData() }, [loadData])

  const loadTrash = useCallback(async () => {
    if (!selectedOrgId) return
    try {
      const res = await api.get<Project[]>(`/orgs/${selectedOrgId}/projects/trash`)
      setTrashProjects(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error('Failed to load trash:', err)
    }
  }, [selectedOrgId])

  useEffect(() => {
    if (selectedFolderId === 'trash') loadTrash()
  }, [selectedFolderId, loadTrash])

  const handleNewProject = async () => {
    if (!selectedOrgId) return
    const name = prompt('Project name:')
    if (!name?.trim()) return
    try {
      const newProject = await api.post<ProjectWithMeta>(`/orgs/${selectedOrgId}/projects`, {
        name: name.trim(),
        folderId: selectedFolderId !== 'all' && selectedFolderId !== 'unfiled' && selectedFolderId !== 'trash'
          ? selectedFolderId
          : undefined,
      })
      navigate(`/editor/${newProject.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateFolder = async () => {
    if (!selectedOrgId || !newFolderName.trim()) return
    try {
      const folder = await api.post<FolderData>(`/orgs/${selectedOrgId}/folders`, {
        name: newFolderName.trim(),
        color: newFolderColor,
      })
      setFolders(prev => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)))
      setNewFolderName('')
      setShowNewFolder(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Projects inside will become unfiled.')) return
    try {
      await api.delete(`/folders/${folderId}`)
      setFolders(prev => prev.filter(f => f.id !== folderId))
      setProjects(prev => prev.map(p => p.folderId === folderId ? { ...p, folderId: null, folder: null } : p))
      if (selectedFolderId === folderId) setSelectedFolderId('all')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRenameFolder = async (folderId: string) => {
    if (!renameValue.trim()) return
    try {
      const updated = await api.put<FolderData>(`/folders/${folderId}`, { name: renameValue.trim() })
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: updated.name } : f))
      setRenamingFolder(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const newProject = await api.post<ProjectWithMeta>(`/projects/${projectId}/duplicate`, {})
      navigate(`/editor/${newProject.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Move this project to trash?')) return
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRestoreProject = async (projectId: string) => {
    try {
      await api.put(`/projects/${projectId}/settings`, { archived: false })
      setTrashProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error(err)
    }
  }

  const handlePermanentDelete = async (projectId: string) => {
    if (!confirm('Permanently delete this project? This cannot be undone.')) return
    try {
      await api.delete(`/projects/${projectId}/permanent`)
      setTrashProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Filter and sort projects
  const displayedProjects = projects
    .filter(p => {
      if (searchQuery) {
        return p.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
      if (selectedFolderId === 'all') return true
      if (selectedFolderId === 'unfiled') return !p.folderId
      return p.folderId === selectedFolderId
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  // Show workspace creation screen if no org exists and auto-create failed
  if (showCreateOrg) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md space-y-6">
          <div>
            <GridhiveLogo size="md" className="mb-3" />
            <p className="text-gray-400 mt-1">Create a workspace to get started.</p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Workspace name</label>
            <input
              type="text"
              value={createOrgName}
              onChange={e => setCreateOrgName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateOrg()}
              placeholder={`${user?.name}'s Workspace`}
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {createOrgError && (
              <p className="text-red-400 text-sm">{createOrgError}</p>
            )}
          </div>
          <button
            onClick={handleCreateOrg}
            disabled={!createOrgName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
          >
            Create Workspace
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" onClick={() => setContextMenu(null)}>
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0" style={{ background: '#0d0f12' }}>
        <div className="flex items-center gap-3">
          <GridhiveLogo size="sm" />
          {selectedOrgId && orgs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                {orgs.find(o => o.id === selectedOrgId)?.name || 'Organization'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showOrgDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[160px] z-10">
                  {orgs.map(org => (
                    <button
                      key={org.id}
                      onClick={() => { setSelectedOrgId(org.id); localStorage.setItem('gridhive-selected-org', org.id); setShowOrgDropdown(false) }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                        org.id === selectedOrgId ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Folders */}
        <aside className="w-56 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
            <SidebarItem
              label="All Projects"
              icon={<LayoutGrid className="w-4 h-4" />}
              active={selectedFolderId === 'all'}
              onClick={() => setSelectedFolderId('all')}
              count={projects.length}
            />
            <SidebarItem
              label="Unfiled"
              icon={<HelpCircle className="w-4 h-4" />}
              active={selectedFolderId === 'unfiled'}
              onClick={() => setSelectedFolderId('unfiled')}
              count={projects.filter(p => !p.folderId).length}
            />

            {folders.length > 0 && (
              <div className="pt-2 pb-1">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium px-2 mb-1">Folders</p>
                {folders.map(folder => (
                  <div key={folder.id} className="group relative">
                    {renamingFolder === folder.id ? (
                      <div className="flex items-center gap-1 px-2 py-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameFolder(folder.id)
                            if (e.key === 'Escape') setRenamingFolder(null)
                          }}
                          onBlur={() => setRenamingFolder(null)}
                          autoFocus
                          className="flex-1 bg-gray-800 text-white text-sm px-1.5 py-0.5 rounded border border-blue-500 outline-none"
                        />
                      </div>
                    ) : (
                      <SidebarItem
                        label={folder.name}
                        icon={
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: folder.color || '#6b7280' }}
                          />
                        }
                        active={selectedFolderId === folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        count={projects.filter(p => p.folderId === folder.id).length}
                        contextMenu={
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              // Show folder options
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        }
                        onRename={() => { setRenamingFolder(folder.id); setRenameValue(folder.name) }}
                        onDelete={() => handleDeleteFolder(folder.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {showNewFolder ? (
              <div className="space-y-2 px-2 pt-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateFolder()
                    if (e.key === 'Escape') setShowNewFolder(false)
                  }}
                  autoFocus
                  className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700 outline-none focus:border-blue-500"
                  placeholder="Folder name"
                />
                <div className="flex gap-1 flex-wrap">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`w-5 h-5 rounded-full transition-transform ${newFolderColor === color ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleCreateFolder}
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 rounded transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewFolder(false)}
                    className="text-xs text-gray-400 hover:text-white py-1 px-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolder(true)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 rounded hover:bg-gray-800 transition-colors mt-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Folder
              </button>
            )}
          </div>

          {/* Trash at bottom */}
          <div className="border-t border-gray-800 p-3">
            <SidebarItem
              label="Trash"
              icon={<Trash2 className="w-4 h-4" />}
              active={selectedFolderId === 'trash'}
              onClick={() => setSelectedFolderId('trash')}
              count={trashProjects.length}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedFolderId === 'trash' ? (
            // Trash View
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Trash</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Projects here are permanently deleted after 30 days</p>
                </div>
              </div>

              {trashProjects.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p>Trash is empty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trashProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Deleted {project.archivedAt ? relativeTime(project.archivedAt) : 'recently'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreProject(project.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(project.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Projects View
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedFolderId === 'all' ? 'All Projects'
                    : selectedFolderId === 'unfiled' ? 'Unfiled Projects'
                    : folders.find(f => f.id === selectedFolderId)?.name || 'Projects'}
                </h2>
                <button
                  onClick={handleNewProject}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              {/* Search + sort bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="updated">Last Modified</option>
                  <option value="name">Name A-Z</option>
                  <option value="created">Created Date</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-20 text-gray-500">Loading projects...</div>
              ) : displayedProjects.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-lg mb-2">No projects{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
                  {!searchQuery && (
                    <button
                      onClick={handleNewProject}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Your First Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={() => navigate(`/editor/${project.id}`)}
                      onDuplicate={() => handleDuplicateProject(project.id)}
                      onDelete={() => handleDeleteProject(project.id)}
                      folders={folders}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SidebarItem({
  label, icon, active, onClick, count, contextMenu, onRename, onDelete,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  count?: number
  contextMenu?: React.ReactNode
  onRename?: () => void
  onDelete?: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
          active ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        {icon}
        <span className="flex-1 text-left truncate">{label}</span>
        {count !== undefined && (
          <span className="text-[10px] text-gray-600">{count}</span>
        )}
      </button>
      {(onRename || onDelete) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="text-gray-500 hover:text-white p-0.5 rounded"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-[100px]">
                {onRename && (
                  <button
                    onClick={e => { e.stopPropagation(); setShowMenu(false); onRename() }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="w-3 h-3" />
                    Rename
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={e => { e.stopPropagation(); setShowMenu(false); onDelete() }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project, onOpen, onDuplicate, onDelete, folders
}: {
  project: ProjectWithMeta
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  folders: FolderData[]
}) {
  const [showMenu, setShowMenu] = useState(false)
  const thumbnail = project.versions?.[0]?.thumbnailBase64

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
      onClick={() => { if (showMenu) setShowMenu(false); else onOpen() }}
    >
      {/* Thumbnail */}
      <div className="h-28 bg-gray-800 relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="Project thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-gray-700 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-gray-700" />
            </div>
          </div>
        )}

        {/* Context menu button — always visible */}
        <div className="absolute top-2 right-2" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 bg-gray-900/90 hover:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[140px]">
                <button onClick={() => { setShowMenu(false); onOpen() }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5" />Open
                </button>
                <button onClick={() => { setShowMenu(false); onDuplicate() }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5" />Duplicate
                </button>
                <div className="border-t border-gray-700 my-1" />
                <button onClick={() => { setShowMenu(false); onDelete() }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />Move to Trash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {project.folder && (
              <div className="flex items-center gap-1 mb-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.folder.color || '#6b7280' }}
                />
                <span className="text-[10px] text-gray-500 truncate">{project.folder.name}</span>
              </div>
            )}
            <h3 className="font-semibold text-white truncate">{project.name}</h3>
            {project.description && (
              <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Clock className="w-3 h-3 text-gray-600" />
          <span className="text-[10px] text-gray-500">{relativeTime(project.updatedAt)}</span>
          {project.creator && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-[10px] text-gray-500">{project.creator.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
