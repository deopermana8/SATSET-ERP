import type { CreateMenuItemDto, UpdateMenuItemDto } from "../dto/MenuItemDto.js";
import { MenuCategoryRepository } from "../repositories/MenuCategoryRepository.js";
import { MenuItemRepository } from "../repositories/MenuItemRepository.js";
import type { MenuItemEntity } from "../repositories/MenuItemRepository.js";

export class MenuItemServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "MenuItemServiceError";
  }
}

export class MenuItemService {
  constructor(
    private readonly repository: MenuItemRepository,
    private readonly categoryRepository: MenuCategoryRepository
  ) {}

  async findAll(): Promise<MenuItemEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<MenuItemEntity> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new MenuItemServiceError("Menu item not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<MenuItemEntity> {
    const payload = this.validateCreate(data);
    await this.ensureCategoryActive(payload.categoryId);

    const duplicated = await this.repository.findByCode(payload.code);
    if (duplicated) {
      throw new MenuItemServiceError("Menu item code already exists", 409);
    }

    return this.repository.create(payload);
  }

  async update(id: string, data: unknown): Promise<MenuItemEntity> {
    const current = await this.findById(id);
    const payload = this.validateUpdate(data);

    if (payload.categoryId) {
      await this.ensureCategoryActive(payload.categoryId);
    }

    if (payload.code && payload.code.toLowerCase() !== current.code.toLowerCase()) {
      const duplicated = await this.repository.findByCode(payload.code);
      if (duplicated) {
        throw new MenuItemServiceError("Menu item code already exists", 409);
      }
    }

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new MenuItemServiceError("Menu item not found", 404);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new MenuItemServiceError("Menu item not found", 404);
    }
  }

  private async ensureCategoryActive(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new MenuItemServiceError("Menu category not found", 404);
    }
    if (!category.active) {
      throw new MenuItemServiceError("Menu category is inactive", 409);
    }
  }

  private validateCreate(data: unknown): CreateMenuItemDto {
    if (!this.isRecord(data)) {
      throw new MenuItemServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      categoryId: this.requiredText(data.categoryId, "categoryId"),
      code: this.requiredText(data.code, "code").toUpperCase(),
      name: this.requiredText(data.name, "name"),
      price: this.requiredNumber(data.price, "price"),
      stock: this.requiredInteger(data.stock, "stock"),
      active: this.requiredBoolean(data.active, "active")
    };
  }

  private validateUpdate(data: unknown): UpdateMenuItemDto {
    if (!this.isRecord(data)) {
      throw new MenuItemServiceError("Invalid payload: body must be an object", 400);
    }

    const payload: UpdateMenuItemDto = {};
    if (data.categoryId !== undefined) payload.categoryId = this.requiredText(data.categoryId, "categoryId");
    if (data.code !== undefined) payload.code = this.requiredText(data.code, "code").toUpperCase();
    if (data.name !== undefined) payload.name = this.requiredText(data.name, "name");
    if (data.price !== undefined) payload.price = this.requiredNumber(data.price, "price");
    if (data.stock !== undefined) payload.stock = this.requiredInteger(data.stock, "stock");
    if (data.active !== undefined) payload.active = this.requiredBoolean(data.active, "active");

    if (Object.keys(payload).length === 0) {
      throw new MenuItemServiceError("Invalid payload: no fields to update", 400);
    }

    return payload;
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new MenuItemServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
      throw new MenuItemServiceError(`Invalid payload: ${field} must be a non-negative integer`, 400);
    }
    return value;
  }

  private requiredNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new MenuItemServiceError(`Invalid payload: ${field} must be a non-negative number`, 400);
    }
    return value;
  }

  private requiredBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
      throw new MenuItemServiceError(`Invalid payload: ${field} must be a boolean`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
