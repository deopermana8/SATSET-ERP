import { Request, Response } from 'express'
import { VisitorService } from './visitor.service'

export class VisitorController {
    private service = new VisitorService()

    async findAll(req: Request, res: Response) {
        const items = await this.service.findAll()
        res.json(items)
    }

    async findById(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
        const item = await this.service.findById(id)
        if (!item) {
            return res.status(404).json({ message: 'Visitor not found' })
        }
        res.json(item)
    }

    async create(req: Request, res: Response) {
        const payload = req.body
        const created = await this.service.create(payload)
        res.status(201).json(created)
    }

    async update(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
        const payload = req.body
        const updated = await this.service.update(id, payload)
        res.json(updated)
    }

    async delete(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
        await this.service.delete(id)
        res.status(204).send()
    }
}

