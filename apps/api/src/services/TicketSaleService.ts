import { randomUUID } from "node:crypto";

import type { CheckInTicketSaleDto, CreateTicketSaleDto, MarkTicketSalePaidDto, TicketSaleItemDto, UpdateTicketSaleDto } from "../dto/TicketSaleDto.js";
import { CashierShiftRepository } from "../repositories/CashierShiftRepository.js";
import { TicketRepository } from "../repositories/TicketRepository.js";
import type { TicketEntity } from "../repositories/TicketRepository.js";
import { TicketSaleRepository } from "../repositories/TicketSaleRepository.js";
import type { TicketSaleEntity } from "../repositories/TicketSaleRepository.js";
import { TicketSaleValidator } from "../validators/TicketSaleValidator.js";

export class TicketSaleServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "TicketSaleServiceError";
  }
}

export class TicketSaleService {
  constructor(
    private readonly repository: TicketSaleRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly cashierShiftRepository: CashierShiftRepository,
    private readonly validator: TicketSaleValidator
  ) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    return found;
  }

  async create(data: unknown) {
    return this.createSale(data);
  }

  async update(id: string, data: unknown) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }

    const payload: UpdateTicketSaleDto = this.validator.validateUpdate(data);
    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
  }

  async createSale(data: unknown): Promise<TicketSaleEntity> {
    const payload: CreateTicketSaleDto = this.validator.validateCreate(data);

    const saleNumber = payload.saleNumber && payload.saleNumber.trim()
      ? payload.saleNumber.trim()
      : await this.generateSaleNumber();

    const duplicated = await this.repository.findBySaleNumber(saleNumber);
    if (duplicated) {
      throw new TicketSaleServiceError("Sale number already exists", 409);
    }

    const currentShift = await this.cashierShiftRepository.findCurrentOpen();
    if (!currentShift) {
      throw new TicketSaleServiceError("No open shift", 409);
    }

    const normalizedItems = await this.validateQuota(payload.items);
    const financial = this.calculateTotal(normalizedItems, payload.discount ?? 0, payload.tax ?? 0);

    await this.decreaseTicketQuota(normalizedItems);

    return this.repository.create({
      saleNumber,
      ticketNumber: await this.generateTicketNumber(),
      qrToken: this.generateQrToken(),
      shiftId: currentShift.id,
      cashierId: currentShift.cashierId,
      cashierName: currentShift.cashierName,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      paymentMethod: payload.paymentMethod,
      subtotal: financial.subtotal,
      discount: financial.discount,
      tax: financial.tax,
      total: financial.total,
      paidAmount: 0,
      changeAmount: 0,
      status: "NEW",
      soldAt: payload.soldAt ?? new Date().toISOString(),
      items: normalizedItems
    });
  }

  calculateTotal(items: TicketSaleItemDto[], discount: number, tax: number): {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const safeDiscount = Math.max(0, discount);
    const safeTax = Math.max(0, tax);
    const total = Math.max(0, subtotal - safeDiscount + safeTax);

    return {
      subtotal,
      discount: safeDiscount,
      tax: safeTax,
      total
    };
  }

  async validateQuota(items: TicketSaleItemDto[]): Promise<TicketSaleItemDto[]> {
    const normalized: TicketSaleItemDto[] = [];

    for (const item of items) {
      const ticket = await this.ticketRepository.findById(item.ticketId);
      if (!ticket) {
        throw new TicketSaleServiceError(`Ticket not found: ${item.ticketId}`, 404);
      }

      this.assertTicketSellable(ticket, item.qty);
      normalized.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price
      });
    }

    return normalized;
  }

  async decreaseTicketQuota(items: TicketSaleItemDto[]): Promise<void> {
    for (const item of items) {
      const decreased = await this.ticketRepository.decreaseQuota(item.ticketId, item.qty);
      if (!decreased) {
        throw new TicketSaleServiceError(`Insufficient quota for ticket ${item.ticketId}`, 409);
      }
    }
  }

  async generateSaleNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `SALE-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.repository.findBySaleNumber(candidate));

    return candidate;
  }

  async generateTicketNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `TKT-${y}${m}${d}-${String(counter).padStart(6, "0")}`;
      counter += 1;
    } while (await this.repository.findByTicketNumber(candidate));

    return candidate;
  }

  generateQrToken(): string {
    return randomUUID();
  }

  async markPaid(id: string, data: unknown): Promise<TicketSaleEntity> {
    const payload: MarkTicketSalePaidDto = this.validator.validateMarkPaid(data);
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }

    if (sale.status === "VOID") {
      throw new TicketSaleServiceError("VOID_TICKET", 409);
    }

    if (sale.status !== "NEW") {
      throw new TicketSaleServiceError("Ticket sale is not in NEW status", 409);
    }

    if (payload.paymentMethod === "CASH" && payload.paidAmount < sale.total) {
      throw new TicketSaleServiceError("Paid amount is less than total", 400);
    }

    const paidAmount = payload.paymentMethod === "CASH"
      ? payload.paidAmount
      : (payload.paidAmount > 0 ? payload.paidAmount : sale.total);

    const updated = await this.repository.update(id, {
      paymentMethod: payload.paymentMethod,
      paidAmount,
      changeAmount: payload.paymentMethod === "CASH" ? paidAmount - sale.total : 0,
      status: "PAID",
      paidAt: new Date().toISOString()
    });

    if (!updated) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }

    return updated;
  }

  async markPrinted(id: string): Promise<TicketSaleEntity> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    if (sale.status === "VOID") {
      throw new TicketSaleServiceError("VOID_TICKET", 409);
    }
    if (sale.status !== "PAID") {
      throw new TicketSaleServiceError("NOT_PAID", 409);
    }

    const updated = await this.repository.update(id, {
      status: "PRINTED",
      printedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    return updated;
  }

  async checkIn(data: unknown): Promise<TicketSaleEntity> {
    const payload: CheckInTicketSaleDto = this.validator.validateCheckIn(data);
    const sale = await this.repository.findByQrToken(payload.qrToken);
    if (!sale) {
      throw new TicketSaleServiceError("INVALID_TICKET", 404);
    }
    if (sale.status === "VOID") {
      throw new TicketSaleServiceError("VOID_TICKET", 409);
    }
    if (sale.status === "CHECKED_IN") {
      throw new TicketSaleServiceError("ALREADY_CHECKED_IN", 409);
    }
    if (sale.status !== "PRINTED") {
      throw new TicketSaleServiceError("NOT_PRINTED", 409);
    }

    const updated = await this.repository.update(sale.id, {
      status: "CHECKED_IN",
      checkedInAt: new Date().toISOString()
    });
    if (!updated) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    return updated;
  }

  async voidTicket(id: string): Promise<TicketSaleEntity> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    if (sale.status === "CHECKED_IN") {
      throw new TicketSaleServiceError("CHECKED_IN_TICKET", 409);
    }
    if (sale.status === "VOID") {
      throw new TicketSaleServiceError("VOID_TICKET", 409);
    }

    const updated = await this.repository.update(id, {
      status: "VOID",
      voidedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new TicketSaleServiceError("Ticket sale not found", 404);
    }
    return updated;
  }

  async getQrPayload(id: string): Promise<{ ticketNumber: string; qrToken: string; payload: string; svg: string }> {
    const sale = await this.findById(id);
    const payload = `SATSET:${sale.ticketNumber}:${sale.qrToken}`;
    return {
      ticketNumber: sale.ticketNumber,
      qrToken: sale.qrToken,
      payload,
      svg: this.buildQrSvg(payload)
    };
  }

  async getTicketView(id: string): Promise<{
    ticketNumber: string;
    customerName: string;
    ticketType: string;
    qty: number;
    price: number;
    soldAt: string;
    status: TicketSaleEntity["status"];
    qrToken: string;
    qrSvg: string;
    layout80mm: string;
    layout58mm: string;
  }> {
    const sale = await this.findById(id);
    const ticketType = sale.items.map((item) => item.ticketName).join(", ");
    const qty = sale.items.reduce((sum, item) => sum + item.qty, 0);
    const price = sale.total;
    const qrPayload = `SATSET:${sale.ticketNumber}:${sale.qrToken}`;
    return {
      ticketNumber: sale.ticketNumber,
      customerName: sale.customerName,
      ticketType,
      qty,
      price,
      soldAt: sale.soldAt,
      status: sale.status,
      qrToken: sale.qrToken,
      qrSvg: this.buildQrSvg(qrPayload),
      layout80mm: this.buildTicketLayout(sale, "80mm"),
      layout58mm: this.buildTicketLayout(sale, "58mm")
    };
  }

  async getDashboardSummary(): Promise<{
    todaysSales: number;
    todaysVisitor: number;
    checkedIn: number;
    pending: number;
    void: number;
  }> {
    const todayKey = new Date().toISOString().slice(0, 10);
    const all = await this.repository.findAll();
    const today = all.filter((item) => item.soldAt.slice(0, 10) === todayKey);

    return {
      todaysSales: today.reduce((sum, item) => sum + item.total, 0),
      todaysVisitor: today.reduce((sum, item) => sum + item.items.reduce((inner, row) => inner + row.qty, 0), 0),
      checkedIn: today.filter((item) => item.status === "CHECKED_IN").length,
      pending: today.filter((item) => item.status === "NEW" || item.status === "PAID").length,
      void: today.filter((item) => item.status === "VOID").length
    };
  }

  async getReports(): Promise<{
    salesPerHari: Array<{ date: string; total: number; transactions: number }>;
    salesPerKasir: Array<{ cashier: string; total: number; transactions: number }>;
    salesPerJenisTiket: Array<{ ticketName: string; qty: number; total: number }>;
    visitorCheckIn: Array<{ ticketNumber: string; customerName: string; checkedInAt?: string | null }>;
    voidTicket: Array<{ ticketNumber: string; customerName: string; voidedAt?: string | null }>;
  }> {
    const all = await this.repository.findAll();
    const perDay = new Map<string, { total: number; transactions: number }>();
    const perCashier = new Map<string, { total: number; transactions: number }>();
    const perTicket = new Map<string, { qty: number; total: number }>();

    for (const sale of all) {
      const date = sale.soldAt.slice(0, 10);
      const day = perDay.get(date) ?? { total: 0, transactions: 0 };
      day.total += sale.total;
      day.transactions += 1;
      perDay.set(date, day);

      const cashier = sale.cashierName || sale.cashierId || "POS";
      const cashierRow = perCashier.get(cashier) ?? { total: 0, transactions: 0 };
      cashierRow.total += sale.total;
      cashierRow.transactions += 1;
      perCashier.set(cashier, cashierRow);

      for (const item of sale.items) {
        const bucket = perTicket.get(item.ticketName) ?? { qty: 0, total: 0 };
        bucket.qty += item.qty;
        bucket.total += item.total;
        perTicket.set(item.ticketName, bucket);
      }
    }

    return {
      salesPerHari: [...perDay.entries()].map(([date, value]) => ({ date, total: value.total, transactions: value.transactions })),
      salesPerKasir: [...perCashier.entries()].map(([cashier, value]) => ({ cashier, total: value.total, transactions: value.transactions })),
      salesPerJenisTiket: [...perTicket.entries()].map(([ticketName, value]) => ({ ticketName, qty: value.qty, total: value.total })),
      visitorCheckIn: all.filter((item) => item.status === "CHECKED_IN").map((item) => ({ ticketNumber: item.ticketNumber, customerName: item.customerName, checkedInAt: item.checkedInAt })),
      voidTicket: all.filter((item) => item.status === "VOID").map((item) => ({ ticketNumber: item.ticketNumber, customerName: item.customerName, voidedAt: item.voidedAt }))
    };
  }

  private assertTicketSellable(ticket: TicketEntity, qty: number): void {
    if (!ticket.active) {
      throw new TicketSaleServiceError(`Ticket ${ticket.code} is inactive`, 400);
    }

    if (ticket.quota < qty) {
      throw new TicketSaleServiceError(`Ticket ${ticket.code} quota is not enough`, 409);
    }

    const now = Date.now();
    if (new Date(ticket.validFrom).getTime() > now || new Date(ticket.validUntil).getTime() < now) {
      throw new TicketSaleServiceError(`Ticket ${ticket.code} is outside valid period`, 400);
    }
  }

  private buildQrSvg(payload: string): string {
    const escaped = payload.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" fill="#ffffff" stroke="#0f172a"/><text x="12" y="28" font-size="12" font-family="Arial">SATSET QR</text><text x="12" y="58" font-size="10" font-family="Arial">${escaped}</text><rect x="12" y="78" width="196" height="120" fill="#111827" opacity="0.06"/><text x="20" y="144" font-size="12" font-family="Arial">SCAN TOKEN</text></svg>`;
  }

  private buildTicketLayout(sale: TicketSaleEntity, width: "80mm" | "58mm"): string {
    const items = sale.items.map((item) => `${item.ticketName} x${item.qty} - ${item.total}`).join("\n");
    return [
      `WISATA KITA [${width}]`,
      `Ticket Number: ${sale.ticketNumber}`,
      `Nama: ${sale.customerName}`,
      `Jenis Tiket: ${sale.items.map((item) => item.ticketName).join(", ")}`,
      `Qty: ${sale.items.reduce((sum, item) => sum + item.qty, 0)}`,
      `Harga: ${sale.total}`,
      `Tanggal: ${sale.soldAt}`,
      `QR: SATSET:${sale.ticketNumber}:${sale.qrToken}`,
      items
    ].join("\n");
  }
}
