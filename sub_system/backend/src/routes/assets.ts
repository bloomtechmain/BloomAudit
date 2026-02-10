import { Router } from 'express'
import { getAssets, createAsset, getDepreciationSchedule } from '../controllers/assetsController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('assets', 'read'), getAssets)
router.post('/', requirePermission('assets', 'create'), createAsset)
router.get('/:id/depreciation-schedule', requirePermission('assets', 'read'), getDepreciationSchedule)

export default router
