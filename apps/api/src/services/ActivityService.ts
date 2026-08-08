import type { CreateActivityDto, UpdateActivityDto } from "../dto/ActivityDto.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import type { ActivityEntity } from "../repositories/ActivityRepository.js";

export class ActivityServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ActivityServiceError";
  }
}

export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository
  ) {}

  async findAll(): Promise<ActivityEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ActivityEntity> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new ActivityServiceError("Activity not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<ActivityEntity> {
    const payload = this.validateCreate(data);
    const duplicated = await this.repository.findByCode(payload.code);
    if (duplicated) {
      throw new ActivityServiceError("Activity code already exists", 409);
    }
    return this.repository.create(payload);
  }

  async update(id: string, data: unknown): Promise<ActivityEntity> {
    const current = await this.findById(id);
    const payload = this.validateUpdate(data);

    if (payload.code && payload.code.toLowerCase() !== current.code.toLowerCase()) {
      const duplicated = await this.repository.findByCode(payload.code);
      if (duplicated) {
        throw new ActivityServiceError("Activity code already exists", 409);
      }
    }

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new ActivityServiceError("Activity not found", 404);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new ActivityServiceError("Activity not found", 404);
    }
  }

  private validateCreate(data: unknown): CreateActivityDto {
    if (!this.isRecord(data)) {
      throw new ActivityServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      code: this.requiredText(data.code, "code").toUpperCase(),
      name: this.requiredText(data.name, "name"),
      category: this.requiredText(data.category, "category"),
      duration: this.requiredInteger(data.duration, "duration"),
      capacity: this.requiredInteger(data.capacity, "capacity"),
      price: this.requiredNumber(data.price, "price"),
      active: this.requiredBoolean(data.active, "active")
    };
  }

  private validateUpdate(data: unknown): UpdateActivityDto {
    if (!this.isRecord(data)) {
      throw new ActivityServiceError("Invalid payload: body must be an object", 400);
    }

    const payload: UpdateActivityDto = {};
    if (data.code !== undefined) payload.code = this.requiredText(data.code, "code").toUpperCase();
    if (data.name !== undefined) payload.name = this.requiredText(data.name, "name");
    if (data.category !== undefined) payload.category = this.requiredText(data.category, "category");
    if (data.duration !== undefined) payload.duration = this.requiredInteger(data.duration, "duration");
    if (data.capacity !== undefined) payload.capacity = this.requiredInteger(data.capacity, "capacity");
    if (data.price !== undefined) payload.price = this.requiredNumber(data.price, "price");
    if (data.active !== undefined) payload.active = this.requiredBoolean(data.active, "active");

    if (Object.keys(payload).length === 0) {
      throw new ActivityServiceError("Invalid payload: no fields to update", 400);
    }

    return payload;
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new ActivityServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new ActivityServiceError(`Invalid payload: ${field} must be a positive integer`, 400);
    }
    return value;
  }

  private requiredNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new ActivityServiceError(`Invalid payload: ${field} must be a non-negative number`, 400);
    }
    return value;
  }

  private requiredBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
      throw new ActivityServiceError(`Invalid payload: ${field} must be a boolean`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
