
import axios from 'axios'
import { API_URL } from '../config/api'

export type ERPProject = {
  id: number
  owner_name: string
  company_name: string
  package_name: string
  user_limit: number
  db_name: string
  created_at: string
}

export const getERPProjects = async (token: string) => {
  const res = await axios.get(`${API_URL}/erp-projects`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const createERPProject = async (token: string, data: Partial<ERPProject>) => {
  const res = await axios.post(`${API_URL}/erp-projects`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const updateERPProject = async (token: string, id: number, user_limit: number) => {
  const res = await axios.put(`${API_URL}/erp-projects/${id}`, { user_limit }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const getProjectUsers = async (token: string, id: number): Promise<any[]> => {
  const res = await fetch(`${API_URL}/erp-projects/${id}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch project users')
  return res.json()
}
