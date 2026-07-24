import { Request, Response } from 'express'
import { __Satset_Test__Service } from './__satset_test__.service'

export class __Satset_Test__Controller {
    private service = new __Satset_Test__Service()

    async findAll(req: Request, res: Response) {
        const items = await this.service.findAll()
        res.json(items)
    }

    async findById(req: Request, res: Response) {
        const id = req.params.id
        const item = await this.service.findById(id)
        if (!item) {
            return res.status(404).json({ message: '__Satset_Test__ not found' })
        }
        res.json(item)
    }

    async create(req: Request, res: Response) {
        const payload = req.body
        const created = await this.service.create(payload)
        res.status(201).json(created)
    }

    async update(req: Request, res: Response) {
        const id = req.params.id
        const payload = req.body
        const updated = await this.service.update(id, payload)
        res.json(updated)
    }

    async delete(req: Request, res: Response) {
        const id = req.params.id
        await this.service.delete(id)
        res.status(204).send()
    }
}

