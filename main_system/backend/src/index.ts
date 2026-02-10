import express from 'express'
import cors from 'cors'
import { pool } from './db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, verifyToken } from './utils/jwt'
import { requireAuth } from './middleware/auth'
import { validatePasswordStrength } from './utils/passwordGenerator'
import { isPasswordRecentlyUsed, addToPasswordHistory } from './utils/passwordHistory'
import employeeRoutes from './routes/employees'
import projectRoutes from './routes/projects'
import newProjectRoutes from './routes/newProjects'
import accountsRoutes from './routes/accounts'
import vendorRoutes from './routes/vendors'
import payableRoutes from './routes/payables'
import pettyCashRoutes from './routes/pettyCash'
import receivableRoutes from './routes/receivables'
import assetRoutes from './routes/assets'
import analyticsRoutes from './routes/analytics'
import notesRoutes from './routes/notes'
import todosRoutes from './routes/todos'
import rbacRoutes from './routes/rbac'
import settingsRoutes from './routes/settings'
import erpProjectsRoutes from './routes/erpProjectsRoutes'


// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  process.exit(1)
}

const app = express()

// Configure CORS
let corsOrigin: string | string[];
if (process.env.NODE_ENV === 'production') {
  corsOrigin = [
    process.env.FRONTEND_URL || '',
    'https://erpbloom.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter((url) => url !== '')
} else {
  corsOrigin = '*'
}

const corsOptions = {
  origin: corsOrigin,
  credentials: true
}

console.log('🔐 CORS Configuration:', {
  env: process.env.NODE_ENV,
  origin: corsOrigin,
  frontend_url: process.env.FRONTEND_URL || 'NOT_SET'
})

app.use(cors(corsOptions))
app.use(express.json())

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bloomtech ERP API',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

app.use('/employees', employeeRoutes)
app.use('/projects-old', projectRoutes) // Legacy endpoint for backward compatibility
app.use('/projects', newProjectRoutes) // New 3-level hierarchy
app.use('/accounts', accountsRoutes)
app.use('/vendors', vendorRoutes)
app.use('/payables', payableRoutes)
app.use('/petty-cash', pettyCashRoutes)
app.use('/receivables', receivableRoutes)
app.use('/assets', assetRoutes)
app.use('/analytics', analyticsRoutes)
app.use('/notes', notesRoutes)
app.use('/todos', todosRoutes)
app.use('/rbac', rbacRoutes)
app.use('/settings', settingsRoutes)
app.use('/erp-projects', erpProjectsRoutes)

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })
  try {
    // Get user
    const r = await pool.query(`
      SELECT u.id, u.name, u.email, u.password_hash, 
             COALESCE(u.password_must_change, FALSE) as password_must_change
      FROM users u
      WHERE u.email = $1 OR u.name = $1
      LIMIT 1
    `, [email])

    if (!r.rows.length) return res.status(401).json({ error: 'invalid_credentials' })

    const u = r.rows[0] as {
      id: number
      name: string
      email: string
      password_hash: string
      password_must_change: boolean
    }

    const ok = await bcrypt.compare(password, u.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })

    // Get user's roles
    const rolesResult = await pool.query(`
      SELECT r.id, r.name
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `, [u.id])

    const roleIds = rolesResult.rows.map((r: any) => r.id)
    const roleNames = rolesResult.rows.map((r: any) => r.name)

    // Get union of all permissions from all roles
    const permissions: string[] = []
    if (roleIds.length > 0) {
      const permResult = await pool.query(`
        SELECT DISTINCT p.resource, p.action
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ANY($1::int[])
      `, [roleIds])

      permissions.push(...permResult.rows.map((p: any) => `${p.resource}:${p.action}`))
    }

    // Generate JWT tokens
    const payload = {
      userId: u.id,
      email: u.email,
      roleIds,
      roleNames,
      permissions
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        roleIds,
        roleNames,
        roleName: roleNames[0] || null, // Map first role to roleName for frontend compatibility
        roleId: roleIds[0] || null,
        permissions,
        password_must_change: u.password_must_change
      },
      accessToken,
      refreshToken
    })
  } catch (e) {
    console.error('/auth/login error', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Get current user info
app.get('/auth/me', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    // Fetch fresh user data
    const r = await pool.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.id = $1
    `, [req.user.userId])

    if (!r.rows.length) {
      return res.status(404).json({ error: 'user_not_found' })
    }

    const u = r.rows[0]

    // Get user's roles
    const rolesResult = await pool.query(`
      SELECT r.id, r.name
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `, [u.id])

    const roleIds = rolesResult.rows.map((r: any) => r.id)
    const roleNames = rolesResult.rows.map((r: any) => r.name)

    // Get union of all permissions from all roles
    const permissions: string[] = []
    if (roleIds.length > 0) {
      const permResult = await pool.query(`
        SELECT DISTINCT p.resource, p.action
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ANY($1::int[])
      `, [roleIds])

      permissions.push(...permResult.rows.map((p: any) => `${p.resource}:${p.action}`))
    }

    return res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        roleIds,
        roleNames,
        permissions
      }
    })
  } catch (e) {
    console.error('/auth/me error', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Refresh access token
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string }

  if (!refreshToken) {
    return res.status(400).json({ error: 'missing_refresh_token' })
  }

  try {
    const decoded = verifyToken(refreshToken)

    if (!decoded) {
      return res.status(401).json({ error: 'invalid_refresh_token' })
    }

    // Generate new access token with current permissions
    const r = await pool.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.id = $1
    `, [decoded.userId])

    if (!r.rows.length) {
      return res.status(404).json({ error: 'user_not_found' })
    }

    const u = r.rows[0]

    // Get user's roles
    const rolesResult = await pool.query(`
      SELECT r.id, r.name
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `, [u.id])

    const roleIds = rolesResult.rows.map((r: any) => r.id)
    const roleNames = rolesResult.rows.map((r: any) => r.name)

    // Get union of all permissions from all roles
    const permissions: string[] = []
    if (roleIds.length > 0) {
      const permResult = await pool.query(`
        SELECT DISTINCT p.resource, p.action
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ANY($1::int[])
      `, [roleIds])

      permissions.push(...permResult.rows.map((p: any) => `${p.resource}:${p.action}`))
    }

    const payload = {
      userId: u.id,
      email: u.email,
      roleIds,
      roleNames,
      permissions
    }

    const newAccessToken = generateAccessToken(payload)

    return res.json({ accessToken: newAccessToken })
  } catch (e) {
    console.error('/auth/refresh error', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Change password endpoint (user self-service)
app.post('/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'validation_error', message: 'Current and new passwords are required' })
  }

  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    // Get user's current password hash
    const userResult = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE id = $1',
      [req.user.userId]
    )

    if (!userResult.rows.length) {
      return res.status(404).json({ error: 'user_not_found' })
    }

    const user = userResult.rows[0]

    // Verify current password
    const currentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!currentPasswordValid) {
      return res.status(401).json({ error: 'invalid_password', message: 'Current password is incorrect' })
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword)
    if (!validation.valid) {
      return res.status(400).json({
        error: 'weak_password',
        message: validation.errors.join(', ')
      })
    }

    // Check if new password matches any of the last 3 passwords
    const isRecentlyUsed = await isPasswordRecentlyUsed(user.id, newPassword)
    if (isRecentlyUsed) {
      return res.status(400).json({
        error: 'password_reused',
        message: 'Cannot reuse any of your last 3 passwords'
      })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password and clear password_must_change flag
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, password_must_change = FALSE 
       WHERE id = $2`,
      [newPasswordHash, user.id]
    )

    // Add to password history
    await addToPasswordHistory(user.id, newPasswordHash)

    // Log audit
    await pool.query(
      `INSERT INTO rbac_audit_log (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [user.id, 'CHANGE_PASSWORD', JSON.stringify({ userId: user.id, email: user.email })]
    )

    console.log(`✅ Password changed successfully for user ${user.email}`)

    return res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (e) {
    console.error('/auth/change-password error', e)
    return res.status(500).json({ error: 'server_error', message: 'Failed to change password' })
  }
})

if (process.env.NODE_ENV !== 'production') {
  app.post('/dev/seed-user', async (req, res) => {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: string }
    if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' })
    try {
      const hash = await bcrypt.hash(password, 10)
      const r = await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id', [name, email, hash, role ?? 'user'])
      return res.json({ inserted: r.rowCount })
    } catch (e) {
      console.error('/dev/seed-user error', e)
      return res.status(500).json({ error: 'server_error' })
    }
  })
  app.post('/dev/upsert-user', async (req, res) => {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: string }
    if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' })
    try {
      const hash = await bcrypt.hash(password, 10)
      const r = await pool.query(
        `INSERT INTO users(name,email,password_hash,role)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(email) DO UPDATE
         SET name=EXCLUDED.name,
             password_hash=EXCLUDED.password_hash,
             role=EXCLUDED.role
         RETURNING id`,
        [name, email, hash, role ?? 'user']
      )
      return res.json({ upserted: r.rowCount })
    } catch (e) {
      console.error('/dev/upsert-user error', e)
      return res.status(500).json({ error: 'server_error' })
    }
  })
}

// Async startup function to ensure proper initialization order
async function startServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000

  try {
    // First, test database connection
    console.log('🔄 Testing database connection...')
    await pool.connect()
    console.log('✅ Database connected successfully')

    // Then start the HTTP server
    console.log(`🔄 Starting HTTP server on port ${port}...`)
    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is ready and accepting connections`)
      console.log(`🌐 API available at http://localhost:${port}`)
      console.log(`🎯 Health check endpoint: http://localhost:${port}/`)
    })
  } catch (err) {
    console.error('❌ Startup error:', err)
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'is set' : 'is NOT set')
    process.exit(1)
  }
}

// Start the server
startServer().catch(err => {
  console.error('❌ Fatal error during startup:', err)
  process.exit(1)
})
