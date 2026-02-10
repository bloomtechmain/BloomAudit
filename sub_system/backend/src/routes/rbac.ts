import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { requireSettingsManage } from '../middleware/authorize'
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getPermissionsByRole,
  assignPermissionsToRole,
  createUser,
  getAllUsersWithRoles,
  assignRolesToUser,
  resetUserPassword,
  deleteUser
} from '../controllers/rbacController'

const router = Router()

// Public endpoint for sharing - only requires authentication
router.get('/users/for-sharing', requireAuth, getAllUsersWithRoles)

// All other RBAC routes require authentication and settings:manage permission
router.use(requireAuth)
router.use(requireSettingsManage)

// Role routes
router.get('/roles', getAllRoles)
router.get('/roles/:id', getRoleById)
router.post('/roles', createRole)
router.put('/roles/:id', updateRole)
router.delete('/roles/:id', deleteRole)

// Permission routes
router.get('/permissions', getAllPermissions)
router.get('/roles/:roleId/permissions', getPermissionsByRole)
router.post('/roles/:roleId/permissions', assignPermissionsToRole)

// User management routes
router.post('/users', createUser)
router.get('/users', getAllUsersWithRoles)
router.put('/users/:userId/roles', assignRolesToUser)
router.post('/users/:userId/reset-password', resetUserPassword)
router.delete('/users/:userId', deleteUser)

export default router
