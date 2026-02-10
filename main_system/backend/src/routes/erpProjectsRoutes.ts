
import { Router } from 'express'
import { getProjects, createProject, updateProject, getProjectUsers } from '../controllers/erpProjectsController'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, getProjects)
router.get('/:id/users', requireAuth, getProjectUsers)
router.post('/', requireAuth, createProject)
router.put('/:id', requireAuth, updateProject)

export default router
