import { Router } from 'express'
import { VisitorController } from './visitor.controller'

const router = Router()
const controller = new VisitorController()

router.get('/visitor', controller.findAll.bind(controller))
router.get('/visitor/:id', controller.findById.bind(controller))
router.post('/visitor', controller.create.bind(controller))
router.put('/visitor/:id', controller.update.bind(controller))
router.delete('/visitor/:id', controller.delete.bind(controller))

export default router

