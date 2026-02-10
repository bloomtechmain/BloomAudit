
import React, { useEffect, useState } from 'react'
import { getERPProjects, createERPProject, updateERPProject, getProjectUsers } from '../services/erpProjectsApi'
import type { ERPProject } from '../services/erpProjectsApi'

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
      alert('Project created')
      setOwnerName('')
      setCompanyName('')
      setUserLimit(5)
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ERP Projects (Client Systems)</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl mb-4">Add New Client Project</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Owner Name</label>
            <input className="border p-2 w-full rounded" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Company Name</label>
            <input className="border p-2 w-full rounded" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Package</label>
            <select className="border p-2 w-full rounded" value={packageName} onChange={e => setPackageName(e.target.value)}>
              <option>Standard</option>
              <option>Premium</option>
              <option>Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Number of Users (Limit)</label>
            <input type="number" className="border p-2 w-full rounded" value={userLimit} onChange={e => setUserLimit(parseInt(e.target.value))} required min={1} />
          </div>
          <div className="col-span-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Project</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Company</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Package</th>
              <th className="p-3">User Limit</th>
              <th className="p-3">DB Name</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.id}</td>
                <td className="p-3 font-medium">{p.company_name}</td>
                <td className="p-3">{p.owner_name}</td>
                <td className="p-3">{p.package_name}</td>
                <td className="p-3">{p.user_limit}</td>
                <td className="p-3 text-gray-500 text-sm">{p.db_name}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleUpdateLimit(p.id, p.user_limit)} className="text-blue-600 hover:underline">Edit Limit</button>
                  <button onClick={() => handleViewUsers(p)} className="text-green-600 hover:underline">View Users</button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && !loading && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No projects found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Users in {viewingProject.company_name}</h2>
              <button onClick={() => setViewingProject(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            {usersLoading ? (
              <p className="text-center p-4">Loading users...</p>
            ) : projectUsers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {projectUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{u.id}</td>
                      <td className="p-2 font-medium">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role || '-'}</td>
                      <td className="p-2 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-center text-gray-500">No users found in this project.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
