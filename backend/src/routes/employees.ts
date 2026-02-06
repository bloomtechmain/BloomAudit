import { Router } from 'express'
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Protect all routes
router.use(requireAuth)

router.get('/', requirePermission('employees', 'read'), getAllEmployees)
router.get('/:id', requirePermission('employees', 'read'), getEmployeeById)
router.post('/', requirePermission('employees', 'create'), createEmployee)
router.put('/:id', requirePermission('employees', 'update'), updateEmployee)
router.delete('/:id', requirePermission('employees', 'delete'), deleteEmployee)


export default router


