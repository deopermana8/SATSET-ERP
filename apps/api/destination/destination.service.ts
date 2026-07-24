import { DestinationRepository } from './destination.repository'

export class DestinationService {
    private repository = new DestinationRepository()

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

