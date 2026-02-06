import { Router } from 'express'
import { getAllPayables, createPayable } from '../controllers/payableController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('payables', 'read'), getAllPayables)
router.post('/', requirePermission('payables', 'create'), createPayable)

export default router
