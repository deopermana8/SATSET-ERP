import { randomUUID } from "node:crypto";

import type { CreateActivityScheduleDto } from "../dto/ActivityScheduleDto.js";

export interface ActivityScheduleEntity {
  id: string;
  activityId: string;
  date: string;
  session: string;
  capacity: number;
  booked: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateActivityScheduleInput {
  date?: string;
  session?: string;
  capacity?: number;
  booked?: number;
  available?: number;
}

export class ActivityScheduleRepository {
  private readonly items = new Map<string, ActivityScheduleEntity>();

  async findAll(): Promise<ActivityScheduleEntity[]> {
    return [...this.items.values()].sort((a, b) => a.date.localeCompare(b.date) || a.session.localeCompare(b.session));
  }

  async findById(id: string): Promise<ActivityScheduleEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByActivityAndSlot(activityId: string, date: string, session: string): Promise<ActivityScheduleEntity | null> {
    for (const item of this.items.values()) {
      if (item.activityId === activityId && item.date === date && item.session.toUpperCase() === session.toUpperCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateActivityScheduleDto): Promise<ActivityScheduleEntity> {
    const now = new Date().toISOString();
    const created: ActivityScheduleEntity = {
      id: randomUUID(),
      activityId: data.activityId,
      date: data.date,
      session: data.session,
      capacity: data.capacity,
      booked: 0,
      available: data.capacity,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateActivityScheduleInput): Promise<ActivityScheduleEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: ActivityScheduleEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }
}
