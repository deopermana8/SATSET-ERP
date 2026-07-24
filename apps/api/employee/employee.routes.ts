import { Router } from 'express'
import { EmployeeController } from './employee.controller'

const router = Router()
const controller = new EmployeeController()

router.get('/employee', controller.findAll.bind(controller))
router.get('/employee/:id', controller.findById.bind(controller))
router.post('/employee', controller.create.bind(controller))
router.put('/employee/:id', controller.update.bind(controller))
router.delete('/employee/:id', controller.delete.bind(controller))

export default router

