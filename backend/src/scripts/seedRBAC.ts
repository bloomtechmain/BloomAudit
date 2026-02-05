import { pool } from '../db'

async function main() {
  console.log('🌱 Seeding RBAC data...')

  // Define all permissions
  const permissions = [
    // Employees
    { resource: 'employees', action: 'create', description: 'Create new employees' },
    { resource: 'employees', action: 'read', description: 'View employee information' },
    { resource: 'employees', action: 'update', description: 'Update employee details' },
    { resource: 'employees', action: 'delete', description: 'Delete employees' },
    
    // Projects
    { resource: 'projects', action: 'create', description: 'Create new projects' },
    { resource: 'projects', action: 'read', description: 'View project information' },
    { resource: 'projects', action: 'update', description: 'Update project details' },
    { resource: 'projects', action: 'delete', description: 'Delete projects' },
    
    // Accounts
    { resource: 'accounts', action: 'create', description: 'Create bank accounts' },
    { resource: 'accounts', action: 'read', description: 'View account information' },
    { resource: 'accounts', action: 'update', description: 'Update account details' },
    { resource: 'accounts', action: 'delete', description: 'Delete accounts' },
    
    // Payables
    { resource: 'payables', action: 'create', description: 'Create payable bills' },
    { resource: 'payables', action: 'read', description: 'View payable information' },
    { resource: 'payables', action: 'update', description: 'Update payable details' },
    { resource: 'payables', action: 'delete', description: 'Delete payables' },
    
    // Receivables
    { resource: 'receivables', action: 'create', description: 'Create receivable bills' },
    { resource: 'receivables', action: 'read', description: 'View receivable information' },
    { resource: 'receivables', action: 'update', description: 'Update receivable details' },
    { resource: 'receivables', action: 'delete', description: 'Delete receivables' },
    
    // Assets
    { resource: 'assets', action: 'create', description: 'Create assets' },
    { resource: 'assets', action: 'read', description: 'View asset information' },
    { resource: 'assets', action: 'update', description: 'Update asset details' },
    { resource: 'assets', action: 'delete', description: 'Delete assets' },
    
    // Vendors
    { resource: 'vendors', action: 'create', description: 'Create vendors' },
    { resource: 'vendors', action: 'read', description: 'View vendor information' },
    { resource: 'vendors', action: 'update', description: 'Update vendor details' },
    { resource: 'vendors', action: 'delete', description: 'Delete vendors' },
    
    // Analytics
    { resource: 'analytics', action: 'read', description: 'View analytics and reports' },
    
    // Settings
    { resource: 'settings', action: 'read', description: 'View settings' },
    { resource: 'settings', action: 'manage', description: 'Manage roles and permissions' },
  ]

  // Insert permissions
  console.log('📝 Inserting permissions...')
  for (const perm of permissions) {
    await pool.query(
      `INSERT INTO permissions (resource, action, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (resource, action) DO NOTHING`,
      [perm.resource, perm.action, perm.description]
    )
  }
  console.log(`✅ ${permissions.length} permissions inserted`)

  // Define default roles
  const roles = [
    { name: 'Super Admin', description: 'Full system access with all permissions', is_system_role: true },
    { name: 'Admin', description: 'Administrative access to most resources', is_system_role: false },
    { name: 'Accountant', description: 'Full access to accounting modules', is_system_role: false },
    { name: 'Project Manager', description: 'Manage projects and related items', is_system_role: false },
    { name: 'Viewer', description: 'Read-only access to all modules', is_system_role: false },
  ]

  // Insert roles
  console.log('👥 Inserting roles...')
  const roleIds: Record<string, number> = {}
  for (const role of roles) {
    const result = await pool.query(
      `INSERT INTO roles (name, description, is_system_role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (name) DO UPDATE 
       SET description = EXCLUDED.description, is_system_role = EXCLUDED.is_system_role
       RETURNING id`,
      [role.name, role.description, role.is_system_role]
    )
    roleIds[role.name] = result.rows[0].id
  }
  console.log(`✅ ${roles.length} roles inserted`)

  // Get all permission IDs
  const allPermissions = await pool.query('SELECT id, resource, action FROM permissions')
  const permissionMap: Record<string, number> = {}
  allPermissions.rows.forEach((p: any) => {
    permissionMap[`${p.resource}:${p.action}`] = p.id
  })

  // Define role-permission mappings
  console.log('🔗 Assigning permissions to roles...')

  // Super Admin gets ALL permissions
  const superAdminPerms = Object.values(permissionMap)
  for (const permId of superAdminPerms) {
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING`,
      [roleIds['Super Admin'], permId]
    )
  }
  console.log(`✅ Super Admin: ${superAdminPerms.length} permissions`)

  // Admin gets most permissions except settings:manage
  const adminPerms = [
    'employees:create', 'employees:read', 'employees:update', 'employees:delete',
    'projects:create', 'projects:read', 'projects:update', 'projects:delete',
    'vendors:create', 'vendors:read', 'vendors:update', 'vendors:delete',
    'accounts:create', 'accounts:read', 'accounts:update', 'accounts:delete',
    'payables:create', 'payables:read', 'payables:update', 'payables:delete',
    'receivables:create', 'receivables:read', 'receivables:update', 'receivables:delete',
    'assets:create', 'assets:read', 'assets:update', 'assets:delete',
    'analytics:read',
    'settings:read',
  ]
  for (const perm of adminPerms) {
    if (permissionMap[perm]) {
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [roleIds['Admin'], permissionMap[perm]]
      )
    }
  }
  console.log(`✅ Admin: ${adminPerms.length} permissions`)

  // Accountant gets full accounting access
  const accountantPerms = [
    'accounts:create', 'accounts:read', 'accounts:update', 'accounts:delete',
    'payables:create', 'payables:read', 'payables:update', 'payables:delete',
    'receivables:create', 'receivables:read', 'receivables:update', 'receivables:delete',
    'assets:create', 'assets:read', 'assets:update', 'assets:delete',
    'vendors:read',
    'employees:read',
    'projects:read',
    'analytics:read',
  ]
  for (const perm of accountantPerms) {
    if (permissionMap[perm]) {
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [roleIds['Accountant'], permissionMap[perm]]
      )
    }
  }
  console.log(`✅ Accountant: ${accountantPerms.length} permissions`)

  // Project Manager gets full project access
  const projectManagerPerms = [
    'projects:create', 'projects:read', 'projects:update', 'projects:delete',
    'employees:read',
    'vendors:read',
    'accounts:read',
    'payables:read',
    'receivables:read',
    'analytics:read',
  ]
  for (const perm of projectManagerPerms) {
    if (permissionMap[perm]) {
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [roleIds['Project Manager'], permissionMap[perm]]
      )
    }
  }
  console.log(`✅ Project Manager: ${projectManagerPerms.length} permissions`)

  // Viewer gets read-only access
  const viewerPerms = [
    'employees:read',
    'projects:read',
    'accounts:read',
    'payables:read',
    'receivables:read',
    'assets:read',
    'vendors:read',
    'analytics:read',
  ]
  for (const perm of viewerPerms) {
    if (permissionMap[perm]) {
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [roleIds['Viewer'], permissionMap[perm]]
      )
    }
  }
  console.log(`✅ Viewer: ${viewerPerms.length} permissions`)

  // Update existing admin user to have Super Admin role
  await pool.query(
    `UPDATE users SET role_id = $1 WHERE email = 'admin@example.com' OR name = 'admin'`,
    [roleIds['Super Admin']]
  )
  console.log('✅ Admin user updated with Super Admin role')

  console.log('🎉 RBAC seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding RBAC:', e)
    process.exitCode = 1
  })
  .finally(() => pool.end())
