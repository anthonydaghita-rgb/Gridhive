import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'
import type { Project, Organization } from '@gridhive/shared'

export function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const handleNewProject = async () => {
    if (!selectedOrgId || !newProjectName.trim()) return
    try {
      const project = await api.post<Project>(`/orgs/${selectedOrgId}/projects`, {
        name: newProjectName,
      })
      navigate(`/editor/${project.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">Gridhive</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <button
            onClick={() => navigate('/editor')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create a new project to get started</p>
            <button
              onClick={() => navigate('/editor')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Start Building
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <h3 className="font-semibold text-white">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                )}
                <p className="text-gray-600 text-xs mt-3">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
