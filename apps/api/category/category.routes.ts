import { Router } from 'express'
import { CategoryController } from './category.controller'

const router = Router()
const controller = new CategoryController()

router.get('/category', controller.findAll.bind(controller))
router.get('/category/:id', controller.findById.bind(controller))
router.post('/category', controller.create.bind(controller))
router.put('/category/:id', controller.update.bind(controller))
router.delete('/category/:id', controller.delete.bind(controller))

export default router

