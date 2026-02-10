import { Router } from 'express'
import { getAllVendors, createVendor } from '../controllers/vendorController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('vendors', 'read'), getAllVendors)
router.post('/', requirePermission('vendors', 'create'), createVendor)

export default router
