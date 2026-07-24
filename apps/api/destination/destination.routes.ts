import { Router } from 'express'
import { DestinationController } from './destination.controller'

const router = Router()
const controller = new DestinationController()

router.get('/destination', controller.findAll.bind(controller))
router.get('/destination/:id', controller.findById.bind(controller))
router.post('/destination', controller.create.bind(controller))
router.put('/destination/:id', controller.update.bind(controller))
router.delete('/destination/:id', controller.delete.bind(controller))

export default router

