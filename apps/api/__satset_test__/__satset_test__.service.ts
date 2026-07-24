import { __Satset_Test__Repository } from './__satset_test__.repository'

export class __Satset_Test__Service {
    private repository = new __Satset_Test__Repository()

    async findAll() {
        return this.repository.findAll()
    }

    async findById(id: string) {
        return this.repository.findById(id)
    }

    async create(payload: any) {
        return this.repository.insert(payload)
    }

    async update(id: string, payload: any) {
        return this.repository.update(id, payload)
    }

    async delete(id: string) {
        return this.repository.delete(id)
    }
}

