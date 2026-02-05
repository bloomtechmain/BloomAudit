import { Router } from 'express'
import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '../controllers/newProjectsController'
import { getContractsByProject, createContract, getContractById, updateContract, deleteContract } from '../controllers/contractsController'
import { getItemsByContract, createItem, updateItem, deleteItem } from '../controllers/contractItemsController'

const router = Router()

// Projects routes
router.get('/', getAllProjects)
router.post('/', createProject)
router.get('/:id', getProjectById)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// Contracts routes (nested under projects)
router.get('/:projectId/contracts', getContractsByProject)
router.post('/:projectId/contracts', createContract)
router.get('/:projectId/contracts/:contractId', getContractById)
router.put('/:projectId/contracts/:contractId', updateContract)
router.delete('/:projectId/contracts/:contractId', deleteContract)

// Contract items routes (nested under contracts)
router.get('/:projectId/contracts/:contractId/items', getItemsByContract)
router.post('/:projectId/contracts/:contractId/items', createItem)
router.put('/:projectId/contracts/:contractId/items/:requirements', updateItem)
router.delete('/:projectId/contracts/:contractId/items/:requirements', deleteItem)

export default router
