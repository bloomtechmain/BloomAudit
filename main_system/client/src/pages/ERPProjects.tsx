
import React, { useEffect, useState } from 'react'
import { getERPProjects, createERPProject, updateERPProject, getProjectUsers } from '../services/erpProjectsApi'
import type { ERPProject } from '../services/erpProjectsApi'
import {
  Plus,
  Search,
  Building2,
  User,
  Database,
  Users,
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react'

type Props = {
  accessToken: string
}

export default function ERPProjects({ accessToken }: Props) {
  const [projects, setProjects] = useState<ERPProject[]>([])
  const [loading, setLoading] = useState(false)

  // Form state
  const [ownerName, setOwnerName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [packageName, setPackageName] = useState('Standard')
  const [userLimit, setUserLimit] = useState(5)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // View Users state
  const [viewingProject, setViewingProject] = useState<ERPProject | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [projectUsers, setProjectUsers] = useState<any[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await getERPProjects(accessToken)
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        console.error('Unexpected API response:', data)
        setProjects([])
      }
    } catch (err) {
      console.error(err)
      alert('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerName || !companyName) return alert('Fill required fields')

    try {
      await createERPProject(accessToken, {
        owner_name: ownerName,
        company_name: companyName,
        package_name: packageName,
        user_limit: userLimit
      })
      alert('Project created successfully')
      setOwnerName('')
      setCompanyName('')
      setUserLimit(5)
      setIsFormOpen(false)
      loadProjects()
    } catch (err) {
      console.error(err)
      alert('Failed to create project')
    }
  }

  const handleUpdateLimit = async (id: number, currentLimit: number) => {
    const newLimit = prompt('Enter new user limit:', currentLimit.toString())
    if (!newLimit) return
    const limit = parseInt(newLimit)
    if (isNaN(limit)) return alert('Invalid number')

    try {
      await updateERPProject(accessToken, id, limit)
      loadProjects()
    } catch (err) {
      console.error(err)
      alert('Failed to update limit')
    }
  }

  const handleViewUsers = async (project: ERPProject) => {
    setViewingProject(project)
    setUsersLoading(true)
    setProjectUsers([])
    try {
      const users = await getProjectUsers(accessToken, project.id)
      setProjectUsers(users)
    } catch (err) {
      console.error(err)
      alert('Failed to load project users')
    } finally {
      setUsersLoading(false)
    }
  }

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case 'enterprise': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'premium': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <Building2 className="text-white" size={24} />
              </div>
              ERP Projects
            </h1>
            <p className="text-slate-500 mt-2 ml-1">Monitor and manage client environments and resources</p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Projects</span>
              <span className="text-xl font-bold text-slate-700">{projects.length}</span>
            </div>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`${isFormOpen ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white shadow-blue-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                } px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200`}
            >
              {isFormOpen ? <X size={20} /> : <Plus size={20} />}
              {isFormOpen ? 'Cancel' : 'New Project'}
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <h2 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Plus className="text-blue-600" size={18} />
            </div>
            Create New Client Environment
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Owner Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  className="pl-12 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Company Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  className="pl-12 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Subscription Package</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select
                  className="pl-12 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                  value={packageName}
                  onChange={e => setPackageName(e.target.value)}
                >
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>Enterprise</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <div className="border-t-[5px] border-t-slate-400 border-x-[4px] border-x-transparent" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">User Limit</label>
              <div className="relative group">
                <Users className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="number"
                  className="pl-12 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={userLimit}
                  onChange={e => setUserLimit(parseInt(e.target.value))}
                  required
                  min={1}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5">
                Launch Environment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">ID</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Company Info</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Package</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Resources</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Database</th>
                <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 text-slate-400 font-mono text-sm">#{p.id.toString().padStart(3, '0')}</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{p.company_name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <User size={14} className="text-slate-400" /> {p.owner_name}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPackageColor(p.package_name)} shadow-sm`}>
                      {p.package_name}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="font-semibold text-sm">{p.user_limit}</span> <span className="text-xs text-slate-500">users</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 w-fit">
                      <Database size={12} className="text-slate-400" />
                      {p.db_name}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleUpdateLimit(p.id, p.user_limit)}
                        className="text-slate-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit User Limit"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => handleViewUsers(p)}
                        className="text-slate-500 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100 flex items-center gap-2"
                        title="View Users"
                      >
                        <Users size={18} />
                        <span className="text-sm font-semibold">Users</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="opacity-40" />
                      </div>
                      <p className="text-lg font-semibold text-slate-600">No projects found</p>
                      <p className="text-sm mt-1">Get started by creating a new client environment.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingProject(null)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Users in {viewingProject.company_name}
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Manage user accounts for this client environment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProject(null)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-0">
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Loading user data...</p>
                </div>
              ) : projectUsers.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-400">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-slate-600 font-medium">{u.email}</td>
                        <td className="p-5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {u.role || 'User'}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-slate-500 font-mono">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={40} className="text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">No users found</p>
                  <p className="text-slate-400 mt-1">This project doesn't have any registered users yet.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewingProject(null)}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
