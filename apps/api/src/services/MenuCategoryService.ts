import type { CreateMenuCategoryDto } from "../dto/MenuCategoryDto.js";
import { MenuCategoryRepository } from "../repositories/MenuCategoryRepository.js";
import type { MenuCategoryEntity } from "../repositories/MenuCategoryRepository.js";

export class MenuCategoryServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "MenuCategoryServiceError";
  }
}

export class MenuCategoryService {
  constructor(
    private readonly repository: MenuCategoryRepository
  ) {}

  async findAll(): Promise<MenuCategoryEntity[]> {
    return this.repository.findAll();
  }

  async create(data: unknown): Promise<MenuCategoryEntity> {
    const payload = this.validateCreate(data);
    const duplicated = await this.repository.findByCode(payload.code);
    if (duplicated) {
      throw new MenuCategoryServiceError("Menu category code already exists", 409);
    }
    return this.repository.create(payload);
  }

  private validateCreate(data: unknown): CreateMenuCategoryDto {
    if (!this.isRecord(data)) {
      throw new MenuCategoryServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      code: this.requiredText(data.code, "code").toUpperCase(),
      name: this.requiredText(data.name, "name"),
      active: this.requiredBoolean(data.active, "active")
    };
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new MenuCategoryServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
      throw new MenuCategoryServiceError(`Invalid payload: ${field} must be a boolean`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
