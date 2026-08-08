import { randomUUID } from "node:crypto";

import type { CreateActivityDto, UpdateActivityDto } from "../dto/ActivityDto.js";

export interface ActivityEntity {
  id: string;
  code: string;
  name: string;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ActivityRepository {
  private readonly items = new Map<string, ActivityEntity>();

  async findAll(): Promise<ActivityEntity[]> {
    return [...this.items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string): Promise<ActivityEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByCode(code: string): Promise<ActivityEntity | null> {
    for (const item of this.items.values()) {
      if (item.code.toLowerCase() === code.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateActivityDto): Promise<ActivityEntity> {
    const now = new Date().toISOString();
    const created: ActivityEntity = {
      id: randomUUID(),
      code: data.code,
      name: data.name,
      category: data.category,
      duration: data.duration,
      capacity: data.capacity,
      price: data.price,
      active: data.active,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateActivityDto): Promise<ActivityEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: ActivityEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
