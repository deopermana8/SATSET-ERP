export class VisitorRepository {
    async findAll() {
        return []
    }

    async findById(id: string) {
        return null
    }

    async insert(payload: any) {
        return payload
    }

    async update(id: string, payload: any) {
        return payload
    }

    async delete(id: string) {
        return true
    }
}

