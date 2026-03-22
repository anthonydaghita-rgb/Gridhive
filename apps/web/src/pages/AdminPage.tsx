import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings, Image, Users, AlertTriangle, ArrowLeft, Save, Loader2,
  Upload, X, Trash2, Plus, UserMinus, Mail, Check
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'

interface OrgData {
  id: string
  name: string
  slug: string
  contactEmail?: string
  logoBase64?: string
  members?: MemberData[]
}

interface MemberData {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    createdAt: string
  }
}

type AdminSection = 'org-settings' | 'branding' | 'users' | 'danger'

export function AdminPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [section, setSection] = useState<AdminSection>('org-settings')
  const [org, setOrg] = useState<OrgData | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('member')

  useEffect(() => {
    async function loadOrg() {
      try {
        // Get first org the user belongs to via the projects API
        // We'll try fetching org list or use a session-stored org ID
        const stored = localStorage.getItem('gridhive-selected-org')
        if (stored) {
          setOrgId(stored)
          const orgData = await api.get<OrgData>(`/orgs/${stored}`)
          if (orgData) {
            setOrg(orgData)
            setMembers(orgData.members || [])
            const me = orgData.members?.find(m => m.user.id === user?.id)
            if (me) setUserRole(me.role)
          }
        }
      } catch (err) {
        console.error('Failed to load org:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrg()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center flex-col gap-4">
        <p className="text-gray-400">No organization found. Please create one first.</p>
        <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isAdminOrOwner = ['owner', 'admin'].includes(userRole)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="p-3 space-y-0.5 flex-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium px-2 mb-2">Organization</p>
          <AdminNavItem label="Org Settings" icon={<Settings className="w-4 h-4" />} active={section === 'org-settings'} onClick={() => setSection('org-settings')} />
          <AdminNavItem label="Branding" icon={<Image className="w-4 h-4" />} active={section === 'branding'} onClick={() => setSection('branding')} />
          <AdminNavItem label="Users" icon={<Users className="w-4 h-4" />} active={section === 'users'} onClick={() => setSection('users')} />
          {userRole === 'owner' && (
            <AdminNavItem label="Danger Zone" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} active={section === 'danger'} onClick={() => setSection('danger')} danger />
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-400">{user?.name}</p>
            <p className="capitalize mt-0.5">{userRole}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 max-w-3xl">
        {section === 'org-settings' && (
          <OrgSettingsSection org={org} orgId={orgId!} onSave={setOrg} />
        )}
        {section === 'branding' && (
          <BrandingSection org={org} orgId={orgId!} onLogoChange={logo => setOrg(o => o ? { ...o, logoBase64: logo } : o)} />
        )}
        {section === 'users' && (
          <UsersSection members={members} orgId={orgId!} currentUserId={user?.id || ''} onMembersChange={setMembers} isAdmin={isAdminOrOwner} />
        )}
        {section === 'danger' && userRole === 'owner' && (
          <DangerZoneSection orgId={orgId!} orgName={org.name} />
        )}
      </main>
    </div>
  )
}

function AdminNavItem({ label, icon, active, onClick, danger }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-blue-600/20 text-blue-400'
          : danger
          ? 'text-red-400 hover:bg-red-900/20'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function OrgSettingsSection({ org, orgId, onSave }: { org: OrgData; orgId: string; onSave: (org: OrgData) => void }) {
  const [name, setName] = useState(org.name)
  const [contactEmail, setContactEmail] = useState(org.contactEmail || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.put<OrgData>(`/orgs/${orgId}`, { name, contactEmail: contactEmail || undefined })
      onSave(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Organization Settings</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your organization details</p>

      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Organization Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Slug</label>
          <input type="text" value={org.slug} disabled className="form-input opacity-50 cursor-not-allowed" />
          <p className="text-xs text-gray-600 mt-1">Slug cannot be changed after creation</p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Primary Contact Email</label>
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="form-input" placeholder="contact@yourorg.com" />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function BrandingSection({ org, orgId, onLogoChange }: {
  org: OrgData; orgId: string; onLogoChange: (logo: string | undefined) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [reverting, setReverting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(org.logoBase64 || null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('File size must be under 2MB'); return }

    const form = new FormData()
    form.append('file', file)
    setUploading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/orgs/${orgId}/logo`, {
        method: 'POST', body: form, credentials: 'include',
      })
      const json = await res.json()
      const logo = json.data?.logoBase64
      setPreviewUrl(logo)
      onLogoChange(logo)
    } catch (err) {
      console.error('Logo upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRevert = async () => {
    if (!confirm('Revert to Gridhive default wordmark?')) return
    setReverting(true)
    try {
      await api.delete(`/orgs/${orgId}/logo`)
      setPreviewUrl(null)
      onLogoChange(undefined)
    } catch (err) {
      console.error(err)
    } finally {
      setReverting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Branding</h1>
      <p className="text-gray-400 text-sm mb-8">Customize your organization logo</p>

      <div className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Current Logo</label>
          <div className="w-[300px] h-[80px] bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Organization logo" className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <span className="text-2xl font-bold text-blue-400 tracking-widest">GRIDHIVE</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1.5">Displayed in the header and PDF exports</p>
        </div>

        <div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload New Logo'}
          </button>
          <p className="text-xs text-gray-600 mt-1.5">PNG, SVG, or JPG · Max 2MB · Best at 300x80px</p>
        </div>

        {previewUrl && (
          <button onClick={handleRevert} disabled={reverting} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
            {reverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Revert to Default
          </button>
        )}
      </div>
    </div>
  )
}

function UsersSection({ members, orgId, currentUserId, onMembersChange, isAdmin }: {
  members: MemberData[]; orgId: string; currentUserId: string;
  onMembersChange: (m: MemberData[]) => void; isAdmin: boolean
}) {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const data = await api.post<MemberData & { pending?: boolean }>(`/orgs/${orgId}/members/invite`, { email: inviteEmail, role: inviteRole })
      if (data.pending) {
        setInviteResult(`Invite stub: ${inviteEmail} would receive an invitation. (Email delivery in Phase 3)`)
      } else {
        onMembersChange([...members, data as MemberData])
        setInviteResult(`${inviteEmail} added successfully.`)
      }
      setInviteEmail('')
      setShowInvite(false)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setInviteResult(`Failed: ${e.message || 'Unknown error'}`)
    } finally {
      setInviting(false)
      setTimeout(() => setInviteResult(null), 4000)
    }
  }

  const handleRoleChange = async (memberId: string, userId: string, newRole: string) => {
    try {
      await api.patch(`/orgs/${orgId}/members/${userId}`, { role: newRole })
      onMembersChange(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    } catch (err) { console.error(err) }
  }

  const handleRemove = async (memberId: string, userId: string) => {
    if (!confirm('Remove this member from the organization?')) return
    try {
      await api.delete(`/orgs/${orgId}/members/${userId}`)
      onMembersChange(members.filter(m => m.id !== memberId))
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">User Management</h1>
        {isAdmin && (
          <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" />Invite User
          </button>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-6">{members.length} member{members.length !== 1 ? 's' : ''}</p>

      {inviteResult && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-blue-300">{inviteResult}</div>
      )}

      {showInvite && (
        <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-xl space-y-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />Invite New Member</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email address</label>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="form-input" placeholder="user@example.com" autoFocus />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')} className="form-input">
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
              {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Send Invite
            </button>
            <button onClick={() => setShowInvite(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.user.name}</p>
                <p className="text-xs text-gray-500">{member.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.role === 'owner' ? (
                <span className="text-xs text-amber-400 bg-amber-900/30 border border-amber-700/50 px-2 py-0.5 rounded">Owner</span>
              ) : isAdmin ? (
                <select value={member.role} onChange={e => handleRoleChange(member.id, member.userId, e.target.value)} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 focus:outline-none">
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <span className="text-xs text-gray-400 capitalize">{member.role}</span>
              )}
              {isAdmin && member.userId !== currentUserId && member.role !== 'owner' && (
                <button onClick={() => handleRemove(member.id, member.userId)} className="text-gray-600 hover:text-red-400 transition-colors" title="Remove member">
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DangerZoneSection({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleDelete = async () => {
    if (confirmName !== orgName) return
    setDeleting(true)
    try {
      await api.delete(`/orgs/${orgId}`)
      await logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Danger Zone</h1>
      <p className="text-gray-400 text-sm mb-8">Irreversible and destructive actions</p>

      <div className="border border-red-800/50 rounded-xl p-5 bg-red-900/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400">Delete Organization</h3>
            <p className="text-xs text-gray-400 mt-1">
              This will permanently delete <strong className="text-white">{orgName}</strong> and all its projects, versions, and data. This action cannot be undone.
            </p>
            <div className="mt-4 space-y-2">
              <label className="block text-xs text-gray-400">Type <strong className="text-white">{orgName}</strong> to confirm</label>
              <input type="text" value={confirmName} onChange={e => setConfirmName(e.target.value)} className="form-input border-red-800/50 focus:border-red-500" placeholder={orgName} />
              <button
                onClick={handleDelete}
                disabled={confirmName !== orgName || deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
