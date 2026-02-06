import { Router } from 'express'
import { openAccount, getAccounts } from '../controllers/accountsController'
import { createDebitCard, getDebitCards } from '../controllers/debitCardController'
import { requirePermission } from '../middleware/authorize'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.post('/open-account', requirePermission('accounts', 'create'), openAccount)
router.get('/', requirePermission('accounts', 'read'), getAccounts)
router.post('/debit-cards', requirePermission('accounts', 'create'), createDebitCard)
router.get('/debit-cards', requirePermission('accounts', 'read'), getDebitCards)

export default router
