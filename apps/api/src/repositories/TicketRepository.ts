import { randomUUID } from "node:crypto";

import type { CreateTicketDto, UpdateTicketDto } from "../dto/TicketDto.js";

export interface TicketEntity {
  id: string;
  code: string;
  name: string;
  category: "REGULAR" | "VIP" | "ROMBONGAN";
  price: number;
  quota: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export class TicketRepository {
  private readonly items = new Map<string, TicketEntity>();

  async findAll(): Promise<TicketEntity[]> {
    return [...this.items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string): Promise<TicketEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByCode(code: string): Promise<TicketEntity | null> {
    for (const item of this.items.values()) {
      if (item.code.toLowerCase() === code.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateTicketDto): Promise<TicketEntity> {
    const now = new Date().toISOString();
    const created: TicketEntity = {
      id: randomUUID(),
      code: data.code,
      name: data.name,
      category: data.category as TicketEntity["category"],
      price: data.price,
      quota: data.quota,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      active: data.active,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateTicketDto): Promise<TicketEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: TicketEntity = {
      ...existing,
      ...data,
      category: (data.category as TicketEntity["category"] | undefined) ?? existing.category,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }

  async decreaseQuota(id: string, qty: number): Promise<TicketEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const nextQuota = existing.quota - qty;
    if (nextQuota < 0) {
      return null;
    }

    const updated: TicketEntity = {
      ...existing,
      quota: nextQuota,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  async increaseQuota(id: string, qty: number): Promise<TicketEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: TicketEntity = {
      ...existing,
      quota: existing.quota + qty,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
