import type { CancelPurchaseOrderDto, CreatePurchaseOrderDto } from "../dto/PurchaseOrderDto.js";

export class PurchaseOrderValidator {
  validateCreate(input: CreatePurchaseOrderDto): CreatePurchaseOrderDto {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid payload");
    }

    if (!String(input.supplierId || "").trim()) {
      throw new Error("supplierId is required");
    }

    if (!String(input.supplierName || "").trim()) {
      throw new Error("supplierName is required");
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new Error("Purchase order items are required");
    }

    return input;
  }

  validateCancel(input: unknown): CancelPurchaseOrderDto {
    if (input === undefined || input === null) {
      return {};
    }

    if (typeof input !== "object" || Array.isArray(input)) {
      throw new Error("Invalid cancel payload");
    }

    const data = input as Record<string, unknown>;
    if (data.reason === undefined) {
      return {};
    }

    if (typeof data.reason !== "string") {
      throw new Error("reason must be a string");
    }

    const reason = data.reason.trim();
    if (reason.length > 200) {
      throw new Error("reason length must be <= 200");
    }

    return { reason };
  }
}