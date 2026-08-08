import type { StockMovementQueryDto } from "../dto/StockMovementQueryDto.js";

const MOVEMENT_TYPES = new Set(["IN", "OUT", "ADJUSTMENT"]);

export class StockMovementValidator {
  validateQuery(input: Record<string, string | undefined>): StockMovementQueryDto {
    const query: StockMovementQueryDto = {};

    if (input.inventoryId && input.inventoryId.trim()) {
      query.inventoryId = input.inventoryId.trim();
    }

    if (input.movementType && input.movementType.trim()) {
      const movementType = input.movementType.trim().toUpperCase();
      if (!MOVEMENT_TYPES.has(movementType)) {
        throw new Error("Invalid query: movementType must be IN, OUT, or ADJUSTMENT");
      }
      query.movementType = movementType as "IN" | "OUT" | "ADJUSTMENT";
    }

    if (input.reference && input.reference.trim()) {
      query.reference = input.reference.trim();
    }

    if (input.from && input.from.trim()) {
      query.from = this.validateDate(input.from.trim(), "from");
    }

    if (input.to && input.to.trim()) {
      query.to = this.validateDate(input.to.trim(), "to");
    }

    if (query.from && query.to && query.from > query.to) {
      throw new Error("Invalid query: from cannot be after to");
    }

    return query;
  }

  private validateDate(value: string, field: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`Invalid query: ${field} must be YYYY-MM-DD`);
    }
    return value;
  }
}