import { randomUUID } from "node:crypto";

import type { CreateCustomerDto, UpdateCustomerDto } from "../dto/CustomerDto.js";

export interface CustomerEntity {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export class CustomerRepository {
  private readonly items = new Map<string, CustomerEntity>();

  async findAll(): Promise<CustomerEntity[]> {
    return [...this.items.values()]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByCode(code: string): Promise<CustomerEntity | null> {
    for (const item of this.items.values()) {
      if (item.code.toLowerCase() === code.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    for (const item of this.items.values()) {
      if (item.email.toLowerCase() === email.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateCustomerDto): Promise<CustomerEntity> {
    const now = new Date().toISOString();
    const created: CustomerEntity = {
      id: randomUUID(),
      code: data.code,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateCustomerDto): Promise<CustomerEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: CustomerEntity = {
      ...existing,
      code: data.code ?? existing.code,
      fullName: data.fullName ?? existing.fullName,
      email: data.email ?? existing.email,
      phone: data.phone ?? existing.phone,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
