import { Router } from 'express'
import { PaymentController } from './payment.controller'

const router = Router()
const controller = new PaymentController()

router.get('/payment', controller.findAll.bind(controller))
router.get('/payment/:id', controller.findById.bind(controller))
router.post('/payment', controller.create.bind(controller))
router.put('/payment/:id', controller.update.bind(controller))
router.delete('/payment/:id', controller.delete.bind(controller))

export default router

