import type { CreateActivityScheduleDto } from "../dto/ActivityScheduleDto.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import { ActivityScheduleRepository } from "../repositories/ActivityScheduleRepository.js";
import type { ActivityScheduleEntity } from "../repositories/ActivityScheduleRepository.js";

export class ActivityScheduleServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ActivityScheduleServiceError";
  }
}

export class ActivityScheduleService {
  constructor(
    private readonly repository: ActivityScheduleRepository,
    private readonly activityRepository: ActivityRepository
  ) {}

  async findAll(): Promise<ActivityScheduleEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ActivityScheduleEntity> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new ActivityScheduleServiceError("Activity schedule not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<ActivityScheduleEntity> {
    const payload = this.validateCreate(data);
    const activity = await this.activityRepository.findById(payload.activityId);
    if (!activity) {
      throw new ActivityScheduleServiceError("Activity not found", 404);
    }
    if (!activity.active) {
      throw new ActivityScheduleServiceError("Activity is inactive", 409);
    }

    const duplicated = await this.repository.findByActivityAndSlot(payload.activityId, payload.date, payload.session);
    if (duplicated) {
      throw new ActivityScheduleServiceError("Schedule already exists for this activity and session", 409);
    }

    const finalCapacity = Math.max(payload.capacity, activity.capacity);
    return this.repository.create({
      ...payload,
      capacity: finalCapacity
    });
  }

  async reserveCapacity(scheduleId: string, qty: number): Promise<ActivityScheduleEntity> {
    const schedule = await this.findById(scheduleId);
    if (qty > schedule.available) {
      throw new ActivityScheduleServiceError("Insufficient schedule capacity", 409);
    }

    const updated = await this.repository.update(schedule.id, {
      booked: schedule.booked + qty,
      available: schedule.available - qty
    });
    if (!updated) {
      throw new ActivityScheduleServiceError("Activity schedule not found", 404);
    }
    return updated;
  }

  async releaseCapacity(scheduleId: string, qty: number): Promise<ActivityScheduleEntity> {
    const schedule = await this.findById(scheduleId);
    const booked = Math.max(0, schedule.booked - qty);
    const available = Math.min(schedule.capacity, schedule.available + qty);

    const updated = await this.repository.update(schedule.id, {
      booked,
      available
    });
    if (!updated) {
      throw new ActivityScheduleServiceError("Activity schedule not found", 404);
    }
    return updated;
  }

  private validateCreate(data: unknown): CreateActivityScheduleDto {
    if (!this.isRecord(data)) {
      throw new ActivityScheduleServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      activityId: this.requiredText(data.activityId, "activityId"),
      date: this.requiredDate(data.date, "date"),
      session: this.requiredText(data.session, "session").toUpperCase(),
      capacity: this.requiredInteger(data.capacity, "capacity")
    };
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new ActivityScheduleServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredDate(value: unknown, field: string): string {
    const date = this.requiredText(value, field);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ActivityScheduleServiceError(`Invalid payload: ${field} must be YYYY-MM-DD`, 400);
    }
    return date;
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new ActivityScheduleServiceError(`Invalid payload: ${field} must be a positive integer`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
