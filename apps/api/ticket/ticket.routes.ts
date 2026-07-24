import { Router } from 'express'
import { TicketController } from './ticket.controller'

const router = Router()
const controller = new TicketController()

router.get('/ticket', controller.findAll.bind(controller))
router.get('/ticket/:id', controller.findById.bind(controller))
router.post('/ticket', controller.create.bind(controller))
router.put('/ticket/:id', controller.update.bind(controller))
router.delete('/ticket/:id', controller.delete.bind(controller))

export default router

