import type { CheckInTicketSaleDto, CreateTicketSaleDto, MarkTicketSalePaidDto, TicketSaleItemDto, UpdateTicketSaleDto } from "../dto/TicketSaleDto.js";

const PAYMENT_METHODS = new Set(["CASH", "QRIS", "TRANSFER"]);

export class TicketSaleValidator {
  // Fields: saleNumber, customerName, customerPhone, paymentMethod, subtotal, discount, tax, total, paidAmount, changeAmount, status, soldAt
  validateCreate(data: unknown): CreateTicketSaleDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    return {
      saleNumber: this.optionalText(data.saleNumber),
      customerName: this.requiredText(data.customerName, "customerName"),
      customerPhone: this.requiredText(data.customerPhone, "customerPhone"),
      paymentMethod: this.requiredPaymentMethod(data.paymentMethod),
      discount: data.discount === undefined ? 0 : this.requiredNonNegativeNumber(data.discount, "discount"),
      tax: data.tax === undefined ? 0 : this.requiredNonNegativeNumber(data.tax, "tax"),
      paidAmount: data.paidAmount === undefined ? 0 : this.requiredNonNegativeNumber(data.paidAmount, "paidAmount"),
      items: this.requiredItems(data.items)
    };
  }

  validateUpdate(data: unknown): UpdateTicketSaleDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    const next: UpdateTicketSaleDto = {};
    if (data.customerName !== undefined) next.customerName = this.requiredText(data.customerName, "customerName");
    if (data.customerPhone !== undefined) next.customerPhone = this.requiredText(data.customerPhone, "customerPhone");
    if (data.paymentMethod !== undefined) next.paymentMethod = this.requiredPaymentMethod(data.paymentMethod);
    if (data.discount !== undefined) next.discount = this.requiredNonNegativeNumber(data.discount, "discount");
    if (data.tax !== undefined) next.tax = this.requiredNonNegativeNumber(data.tax, "tax");
    if (data.paidAmount !== undefined) next.paidAmount = this.requiredNonNegativeNumber(data.paidAmount, "paidAmount");
    if (data.status !== undefined) next.status = this.requiredText(data.status, "status").toUpperCase();
    if (data.items !== undefined) next.items = this.requiredItems(data.items);

    if (Object.keys(next).length === 0) {
      throw new Error("Invalid payload: provide at least one field to update");
    }

    return next;
  }

  validateMarkPaid(data: unknown): MarkTicketSalePaidDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    return {
      paymentMethod: this.requiredPaymentMethod(data.paymentMethod),
      paidAmount: this.requiredNonNegativeNumber(data.paidAmount, "paidAmount")
    };
  }

  validateCheckIn(data: unknown): CheckInTicketSaleDto {
    if (!this.isRecord(data)) {
      throw new Error("Invalid payload: body must be an object");
    }

    return {
      qrToken: this.requiredText(data.qrToken, "qrToken")
    };
  }

  private requiredItems(value: unknown): TicketSaleItemDto[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error("Invalid payload: items must be a non-empty array");
    }

    return value.map((item, index) => {
      if (!this.isRecord(item)) {
        throw new Error(`Invalid payload: items[${index}] must be an object`);
      }

      const qty = this.requiredInteger(item.qty, `items[${index}].qty`);
      const price = this.requiredNonNegativeNumber(item.price, `items[${index}].price`);
      const total = item.total === undefined ? qty * price : this.requiredNonNegativeNumber(item.total, `items[${index}].total`);

      return {
        ticketId: this.requiredText(item.ticketId, `items[${index}].ticketId`),
        ticketName: this.requiredText(item.ticketName, `items[${index}].ticketName`),
        qty,
        price,
        total
      };
    });
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

  private optionalText(value: unknown): string | undefined {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (typeof value !== "string") {
      throw new Error("Invalid payload: saleNumber must be a string");
    }
    return value.trim();
  }

  private requiredPaymentMethod(value: unknown): string {
    const method = this.requiredText(value, "paymentMethod").toUpperCase();
    if (!PAYMENT_METHODS.has(method)) {
      throw new Error("Invalid payload: paymentMethod must be CASH, QRIS, or TRANSFER");
    }
    return method;
  }

  private requiredNonNegativeNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new Error(`Invalid payload: ${field} must be a non-negative number`);
    }
    return value;
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new Error(`Invalid payload: ${field} must be a positive integer`);
    }
    return value;
  }
}
