type EmployeeRecord = {
    id: number
    name: string
    email: string
    phone: string
    role: string
}

const storage: EmployeeRecord[] = [
    { id: 1, name: 'Rina Sari', email: 'rina@example.com', phone: '08123456789', role: 'Manager' },
    { id: 2, name: 'Budi Hartono', email: 'budi@example.com', phone: '08123456790', role: 'Staff' },
]

export class EmployeeRepository {
    async findAll() {
        return storage
    }

    async findById(id: string) {
        return storage.find((item) => item.id === Number(id)) ?? null
    }

    async insert(payload: any) {
        const record: EmployeeRecord = {
            id: storage.length > 0 ? Math.max(...storage.map((item) => item.id)) + 1 : 1,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role ?? 'Staff',
        }
        storage.push(record)
        return record
    }

    async update(id: string, payload: any) {
        const index = storage.findIndex((item) => item.id === Number(id))
        if (index === -1) {
            return null
        }
        storage[index] = { ...storage[index], ...payload, id: Number(id) }
        return storage[index]
    }

    async delete(id: string) {
        const index = storage.findIndex((item) => item.id === Number(id))
        if (index === -1) {
            return false
        }
        storage.splice(index, 1)
        return true
    }
}

