import type { CloseCashierShiftDto, OpenCashierShiftDto } from "../dto/CashierShiftDto.js";
import { CashierShiftRepository } from "../repositories/CashierShiftRepository.js";
import type { CashierShiftEntity } from "../repositories/CashierShiftRepository.js";
import { TicketSaleRepository } from "../repositories/TicketSaleRepository.js";

export class CashierShiftServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "CashierShiftServiceError";
  }
}

export class CashierShiftService {
  constructor(
    private readonly repository: CashierShiftRepository,
    private readonly ticketSaleRepository: TicketSaleRepository
  ) {}

  async openShift(data: unknown): Promise<CashierShiftEntity> {
    const payload = this.validateOpenShift(data);
    const current = await this.repository.findCurrentOpen();
    if (current) {
      throw new CashierShiftServiceError("Shift already open", 409);
    }

    return this.repository.create({
      ...payload,
      shiftNumber: await this.generateShiftNumber(),
      openedAt: new Date().toISOString()
    });
  }

  async closeShift(data: unknown): Promise<CashierShiftEntity> {
    const current = await this.repository.findCurrentOpen();
    if (!current) {
      throw new CashierShiftServiceError("No open shift", 404);
    }
    const payload = this.validateCloseShift(data);
    const snapshot = await this.summary(current.id);
    const expectedCash = current.openingCash + snapshot.cashSales;
    const difference = payload.closingCash - expectedCash;

    const closed = await this.repository.update(current.id, {
      closedAt: new Date().toISOString(),
      closingCash: payload.closingCash,
      cashSales: snapshot.cashSales,
      qrisSales: snapshot.qrisSales,
      transferSales: snapshot.transferSales,
      ticketCount: snapshot.ticketCount,
      status: "CLOSED",
      difference
    });

    if (!closed) {
      throw new CashierShiftServiceError("No open shift", 404);
    }

    return closed;
  }

  async getCurrentShift(): Promise<CashierShiftEntity | null> {
    return this.repository.findCurrentOpen();
  }

  async getCurrentShiftOrThrow(): Promise<CashierShiftEntity> {
    const current = await this.repository.findCurrentOpen();
    if (!current) {
      throw new CashierShiftServiceError("No open shift", 409);
    }
    return current;
  }

  async summary(shiftId?: string): Promise<{
    shiftStatus: string;
    cashierName: string;
    openingCash: number;
    cashSales: number;
    qrisSales: number;
    transferSales: number;
    ticketCount: number;
    expectedCash: number;
    currentCash: number;
    difference: number;
  }> {
    const shift = shiftId
      ? await this.repository.findById(shiftId)
      : (await this.repository.findCurrentOpen()) ?? (await this.repository.findAll())[0] ?? null;

    if (!shift) {
      return {
        shiftStatus: "CLOSED",
        cashierName: "-",
        openingCash: 0,
        cashSales: 0,
        qrisSales: 0,
        transferSales: 0,
        ticketCount: 0,
        expectedCash: 0,
        currentCash: 0,
        difference: 0
      };
    }

    const sales = (await this.ticketSaleRepository.findAll()).filter((item) => item.shiftId === shift.id && item.status !== "VOID");
    const cashSales = sales.filter((item) => item.paymentMethod === "CASH").reduce((sum, item) => sum + item.total, 0);
    const qrisSales = sales.filter((item) => item.paymentMethod === "QRIS").reduce((sum, item) => sum + item.total, 0);
    const transferSales = sales.filter((item) => item.paymentMethod === "TRANSFER").reduce((sum, item) => sum + item.total, 0);
    const ticketCount = sales.reduce((sum, item) => sum + item.items.reduce((inner, row) => inner + row.qty, 0), 0);
    const expectedCash = shift.openingCash + cashSales;
    const currentCash = shift.status === "OPEN" ? expectedCash : shift.closingCash;
    const difference = shift.status === "OPEN" ? 0 : shift.difference;

    return {
      shiftStatus: shift.status,
      cashierName: shift.cashierName,
      openingCash: shift.openingCash,
      cashSales,
      qrisSales,
      transferSales,
      ticketCount,
      expectedCash,
      currentCash,
      difference
    };
  }

  async history(): Promise<CashierShiftEntity[]> {
    return this.repository.findAll();
  }

  validateOpenShift(data: unknown): OpenCashierShiftDto {
    if (!this.isRecord(data)) {
      throw new CashierShiftServiceError("Invalid payload: body must be an object", 400);
    }

    const cashierId = this.requiredText(data.cashierId, "cashierId");
    const cashierName = this.requiredText(data.cashierName, "cashierName");
    const openingCash = this.requiredNonNegativeNumber(data.openingCash, "openingCash");

    return { cashierId, cashierName, openingCash };
  }

  private validateCloseShift(data: unknown): CloseCashierShiftDto {
    if (!this.isRecord(data)) {
      throw new CashierShiftServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      closingCash: this.requiredNonNegativeNumber(data.closingCash, "closingCash")
    };
  }

  private async generateShiftNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `SHIFT-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.repository.findByShiftNumber(candidate));

    return candidate;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new CashierShiftServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredNonNegativeNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new CashierShiftServiceError(`Invalid payload: ${field} must be a non-negative number`, 400);
    }
    return value;
  }
}
