import { Router } from 'express'
import { ReservationController } from './reservation.controller'

const router = Router()
const controller = new ReservationController()

router.get('/reservation', controller.findAll.bind(controller))
router.get('/reservation/:id', controller.findById.bind(controller))
router.post('/reservation', controller.create.bind(controller))
router.put('/reservation/:id', controller.update.bind(controller))
router.delete('/reservation/:id', controller.delete.bind(controller))

export default router

