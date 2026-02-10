import { Router } from 'express'
import { createReceivable, getReceivables } from '../controllers/receivableController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('receivables', 'read'), getReceivables)
router.post('/', requirePermission('receivables', 'create'), createReceivable)

export default router
