import { Router } from 'express'
import { __Satset_Test__Controller } from './__satset_test__.controller'

const router = Router()
const controller = new __Satset_Test__Controller()

router.get('/__satset_test__', controller.findAll.bind(controller))
router.get('/__satset_test__/:id', controller.findById.bind(controller))
router.post('/__satset_test__', controller.create.bind(controller))
router.put('/__satset_test__/:id', controller.update.bind(controller))
router.delete('/__satset_test__/:id', controller.delete.bind(controller))

export default router

