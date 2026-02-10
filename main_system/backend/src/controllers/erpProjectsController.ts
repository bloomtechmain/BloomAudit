
import { Request, Response } from 'express'
import { pool } from '../db'
import { Client, Pool } from 'pg'

export const getProjects = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM erp_projects ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}

export const getProjectUsers = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const projResult = await pool.query('SELECT db_name FROM erp_projects WHERE id = $1', [id])
    if (projResult.rows.length === 0) return res.status(404).json({ error: 'Project not found' })
    const { db_name } = projResult.rows[0]

    const baseUrl = process.env.DATABASE_URL || ''
    const clientDbUrl = baseUrl.replace(/\/[^/]+$/, `/${db_name}`)

    const clientPool = new Pool({ connectionString: clientDbUrl })
    try {
      const usersResult = await clientPool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
      res.json(usersResult.rows)
    } finally {
      await clientPool.end()
    }
  } catch (error) {
    console.error('Error fetching project users:', error)
    res.status(500).json({ error: 'Failed to fetch project users' })
  }
}

export const createProject = async (req: Request, res: Response) => {
  const { owner_name, company_name, package_name, user_limit } = req.body
  try {
    // Generate db_name from company_name (simplified)
    const db_name = company_name.replace(/\s+/g, '_') + '_DB'

    // 1. Create record in Main DB
    const result = await pool.query(
      `INSERT INTO erp_projects (owner_name, company_name, package_name, user_limit, db_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [owner_name, company_name, package_name, user_limit, db_name]
    )
    const project = result.rows[0]

    // 2. Attempt to create the physical database
    // We connect to the 'postgres' database to perform administrative tasks
    const connectionString = process.env.DATABASE_URL || ''
    const postgresUrl = connectionString.replace(/\/[^/]+$/, '/postgres') // Switch DB to postgres

    // Note: Creating a DB from a template requires the template to have NO active connections.
    // In a real production env, we'd use a dedicated template DB or handle this asynchronously.
    // For this demo, we'll attempt it but catch errors gracefully.

    try {
      const client = new Client({ connectionString: postgresUrl })
      await client.connect()

      // Check if DB exists
      const dbCheck = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [db_name])
      if (dbCheck.rowCount === 0) {
        // Try to kill connections to template (BloomAudit_DB) - Dangerous in prod!
        await client.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = 'BloomAudit_DB'
          AND pid <> pg_backend_pid();
        `)

        await client.query(`CREATE DATABASE "${db_name}" WITH TEMPLATE "BloomAudit_DB"`)
        console.log(`Database ${db_name} created successfully.`)
      }
      await client.end()
    } catch (dbError) {
      console.error('Failed to create database physically:', dbError)
      // We don't fail the request, just log it. The Admin might need to handle it manually.
    }

    res.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params
  const { user_limit } = req.body
  try {
    const result = await pool.query(
      `UPDATE erp_projects SET user_limit = $1 WHERE id = $2 RETURNING *`,
      [user_limit, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
}
