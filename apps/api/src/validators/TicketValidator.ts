import type { CreateTicketDto, UpdateTicketDto } from "../dto/TicketDto.js";

const TICKET_CATEGORIES = new Set(["REGULAR", "VIP", "ROMBONGAN"]);

export class TicketValidator {
  private static readonly dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Fields: code, name, category, price, quota, validFrom, validUntil, active
  validateCreate(data: unknown): CreateTicketDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    return {
      code: this.requiredText(data.code, "code"),
      name: this.requiredText(data.name, "name"),
      category: this.requiredCategory(data.category),
      price: this.requiredNonNegativeNumber(data.price, "price"),
      quota: this.requiredInteger(data.quota, "quota"),
      validFrom: this.requiredDate(data.validFrom, "validFrom"),
      validUntil: this.requiredDate(data.validUntil, "validUntil"),
      active: this.requiredBoolean(data.active, "active")
    };
  }

  validateUpdate(data: unknown): UpdateTicketDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    const next: UpdateTicketDto = {};
    if (data.code !== undefined) next.code = this.requiredText(data.code, "code");
    if (data.name !== undefined) next.name = this.requiredText(data.name, "name");
    if (data.category !== undefined) next.category = this.requiredCategory(data.category);
    if (data.price !== undefined) next.price = this.requiredNonNegativeNumber(data.price, "price");
    if (data.quota !== undefined) next.quota = this.requiredInteger(data.quota, "quota");
    if (data.validFrom !== undefined) next.validFrom = this.requiredDate(data.validFrom, "validFrom");
    if (data.validUntil !== undefined) next.validUntil = this.requiredDate(data.validUntil, "validUntil");
    if (data.active !== undefined) next.active = this.requiredBoolean(data.active, "active");

    if (Object.keys(next).length === 0) {
      throw new Error("Invalid payload: provide at least one field to update");
    }

    return next;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Invalid payload: ${field} is required`);
    }
    return value.trim();
  }

  private requiredCategory(value: unknown): string {
    const category = this.requiredText(value, "category").toUpperCase();
    if (!TICKET_CATEGORIES.has(category)) {
      throw new Error("Invalid payload: category must be REGULAR, VIP, or ROMBONGAN");
    }
    return category;
  }

  private requiredNonNegativeNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new Error(`Invalid payload: ${field} must be a non-negative number`);
    }
    return value;
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid payload: ${field} must be a non-negative integer`);
    }
    return value;
  }

  private requiredDate(value: unknown, field: string): string {
    if (typeof value !== "string" || !TicketValidator.dateRegex.test(value)) {
      throw new Error(`Invalid payload: ${field} must use YYYY-MM-DD format`);
    }
    return value;
  }

  private requiredBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
      throw new Error(`Invalid payload: ${field} must be a boolean`);
    }
    return value;
  }
}
