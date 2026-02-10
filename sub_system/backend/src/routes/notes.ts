import { Router } from 'express'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  unshareNote,
  getNoteShares
} from '../controllers/notesController'

const router = Router()

router.get('/', getNotes)
router.post('/', createNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)
router.get('/:id/shares', getNoteShares)
router.post('/:id/share', shareNote)
router.delete('/:id/share/:shareId', unshareNote)

export default router
