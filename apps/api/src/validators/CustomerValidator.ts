import type { CreateCustomerDto, UpdateCustomerDto } from "../dto/CustomerDto.js";

export class CustomerValidator {
  private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Fields: code, fullName, email, phone
  validateCreate(data: unknown): CreateCustomerDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    const code = this.requiredText(data.code, "code");
    const fullName = this.requiredText(data.fullName, "fullName");
    const email = this.requiredEmail(data.email);
    const phone = this.optionalText(data.phone, "phone");

    return {
      code,
      fullName,
      email,
      phone
    };
  }

  validateUpdate(data: unknown): UpdateCustomerDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    const next: UpdateCustomerDto = {};

    if (data.code !== undefined) {
      next.code = this.requiredText(data.code, "code");
    }
    if (data.fullName !== undefined) {
      next.fullName = this.requiredText(data.fullName, "fullName");
    }
    if (data.email !== undefined) {
      next.email = this.requiredEmail(data.email);
    }
    if (data.phone !== undefined) {
      next.phone = this.optionalText(data.phone, "phone");
    }

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

  private optionalText(value: unknown, field: string): string | undefined {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new Error(`Invalid payload: ${field} must be a string`);
    }
    return value.trim();
  }

  private requiredEmail(value: unknown): string {
    const email = this.requiredText(value, "email").toLowerCase();
    if (!CustomerValidator.emailRegex.test(email)) {
      throw new Error("Invalid payload: email format is invalid");
    }
    return email;
  }
}
