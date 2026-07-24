import { Router } from 'express'
import { FacilityController } from './facility.controller'

const router = Router()
const controller = new FacilityController()

router.get('/facility', controller.findAll.bind(controller))
router.get('/facility/:id', controller.findById.bind(controller))
router.post('/facility', controller.create.bind(controller))
router.put('/facility/:id', controller.update.bind(controller))
router.delete('/facility/:id', controller.delete.bind(controller))

export default router

