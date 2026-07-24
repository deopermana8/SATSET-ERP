import { FacilityRepository } from './facility.repository'

export class FacilityService {
    private repository = new FacilityRepository()

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

