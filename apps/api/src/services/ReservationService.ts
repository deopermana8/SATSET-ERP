import { randomUUID } from "node:crypto";

import type { CreateReservationDto, PayReservationDto, ReservationItemDto } from "../dto/ReservationDto.js";
import { CashierShiftRepository } from "../repositories/CashierShiftRepository.js";
import { ReservationRepository } from "../repositories/ReservationRepository.js";
import type { ReservationEntity } from "../repositories/ReservationRepository.js";
import { TicketRepository } from "../repositories/TicketRepository.js";
import { TicketSaleRepository } from "../repositories/TicketSaleRepository.js";

const PAYMENT_METHODS = new Set(["CASH", "QRIS", "TRANSFER"]);
const RESERVATION_EXPIRY_MINUTES = 20;

export class ReservationServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ReservationServiceError";
  }
}

export class ReservationService {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketSaleRepository: TicketSaleRepository,
    private readonly cashierShiftRepository: CashierShiftRepository
  ) {}

  async findAll(): Promise<ReservationEntity[]> {
    await this.expirePendingReservations();
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ReservationEntity> {
    await this.expirePendingReservations();
    const found = await this.repository.findById(id);
    if (!found) {
      throw new ReservationServiceError("Reservation not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<ReservationEntity> {
    await this.expirePendingReservations();
    const payload = this.validateCreate(data);
    const items = await this.validateAndNormalizeItems(payload.visitDate, payload.ticketItems);

    await this.reserveQuota(items);

    return this.repository.create({
      bookingNumber: await this.generateBookingNumber(),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      visitDate: payload.visitDate,
      visitSession: payload.visitSession,
      paymentMethod: payload.paymentMethod,
      totalVisitor: items.reduce((sum, item) => sum + item.qty, 0),
      totalAmount: items.reduce((sum, item) => sum + item.total, 0),
      qrToken: this.generateQrToken(),
      ticketItems: items
    });
  }

  async pay(id: string, data: unknown): Promise<ReservationEntity> {
    await this.expirePendingReservations();
    const reservation = await this.findById(id);
    if (!["NEW", "WAITING_PAYMENT"].includes(reservation.reservationStatus)) {
      throw new ReservationServiceError("Reservation is not waiting payment", 409);
    }

    const payload = this.validatePay(data);
    const updated = await this.repository.update(id, {
      paymentMethod: payload.paymentMethod,
      paymentStatus: "PAID",
      reservationStatus: "PAID",
      paidAt: new Date().toISOString()
    });

    if (!updated) {
      throw new ReservationServiceError("Reservation not found", 404);
    }
    return updated;
  }

  async confirm(id: string): Promise<ReservationEntity> {
    await this.expirePendingReservations();
    const reservation = await this.findById(id);
    if (reservation.paymentStatus !== "PAID") {
      throw new ReservationServiceError("Reservation is not paid", 409);
    }
    if (!["PAID", "WAITING_PAYMENT"].includes(reservation.reservationStatus)) {
      throw new ReservationServiceError("Reservation cannot be confirmed", 409);
    }

    const updated = await this.repository.update(id, {
      reservationStatus: "CONFIRMED",
      confirmedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new ReservationServiceError("Reservation not found", 404);
    }
    return updated;
  }

  async checkIn(id: string): Promise<{ reservation: ReservationEntity; ticketSaleId: string; ticketNumber: string }> {
    await this.expirePendingReservations();
    const reservation = await this.findById(id);
    if (reservation.reservationStatus === "CANCELLED" || reservation.reservationStatus === "VOID") {
      throw new ReservationServiceError("Reservation already cancelled", 409);
    }
    if (reservation.reservationStatus === "CHECKED_IN" || reservation.reservationStatus === "COMPLETED") {
      throw new ReservationServiceError("Reservation already checked in", 409);
    }
    if (reservation.reservationStatus !== "CONFIRMED") {
      throw new ReservationServiceError("Reservation is not confirmed", 409);
    }

    const openShift = await this.cashierShiftRepository.findCurrentOpen();
    const saleNumber = await this.generateSaleNumber();
    const ticketNumber = await this.generateTicketNumber();

    const sale = await this.ticketSaleRepository.create({
      saleNumber,
      ticketNumber,
      qrToken: randomUUID(),
      shiftId: openShift?.id ?? "SYSTEM",
      cashierId: openShift?.cashierId ?? "SYSTEM",
      cashierName: openShift?.cashierName ?? "System Gate",
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      paymentMethod: reservation.paymentMethod,
      subtotal: reservation.totalAmount,
      discount: 0,
      tax: 0,
      total: reservation.totalAmount,
      paidAmount: reservation.totalAmount,
      changeAmount: 0,
      status: "CHECKED_IN",
      soldAt: new Date().toISOString(),
      paidAt: reservation.paidAt ?? new Date().toISOString(),
      checkedInAt: new Date().toISOString(),
      items: reservation.ticketItems
    });

    const updated = await this.repository.update(id, {
      reservationStatus: "CHECKED_IN",
      checkedInAt: new Date().toISOString(),
      ticketSaleId: sale.id
    });
    if (!updated) {
      throw new ReservationServiceError("Reservation not found", 404);
    }

    return {
      reservation: updated,
      ticketSaleId: sale.id,
      ticketNumber: sale.ticketNumber
    };
  }

  async cancel(id: string): Promise<ReservationEntity> {
    await this.expirePendingReservations();
    const reservation = await this.findById(id);
    if (["CHECKED_IN", "COMPLETED"].includes(reservation.reservationStatus)) {
      throw new ReservationServiceError("Checked-in reservation cannot be cancelled", 409);
    }
    if (["CANCELLED", "VOID"].includes(reservation.reservationStatus)) {
      throw new ReservationServiceError("Reservation already cancelled", 409);
    }

    await this.releaseQuota(reservation.ticketItems);

    const updated = await this.repository.update(id, {
      paymentStatus: reservation.paymentStatus === "PAID" ? "PAID" : "CANCELLED",
      reservationStatus: "CANCELLED",
      cancelledAt: new Date().toISOString()
    });
    if (!updated) {
      throw new ReservationServiceError("Reservation not found", 404);
    }
    return updated;
  }

  async getQr(id: string): Promise<{ bookingNumber: string; qrToken: string; payload: string; svg: string }> {
    const reservation = await this.findById(id);
    const payload = `SATSET:RESERVATION:${reservation.bookingNumber}:${reservation.qrToken}`;
    return {
      bookingNumber: reservation.bookingNumber,
      qrToken: reservation.qrToken,
      payload,
      svg: this.buildQrSvg(payload)
    };
  }

  async getReport(): Promise<{
    totalReservation: number;
    waitingPayment: number;
    paidReservation: number;
    reservationToday: number;
    todayVisitor: number;
    upcomingVisitor: number;
    totalAmountPaid: number;
  }> {
    await this.expirePendingReservations();
    const rows = await this.repository.findAll();
    const today = this.today();
    const tomorrow = this.tomorrow();

    const paidRows = rows.filter((item) => item.paymentStatus === "PAID");
    const waitingRows = rows.filter((item) => item.paymentStatus === "WAITING_PAYMENT");
    const todayRows = rows.filter((item) => item.visitDate === today);
    const todayVisitors = rows
      .filter((item) => item.visitDate === today && ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(item.reservationStatus))
      .reduce((sum, item) => sum + item.totalVisitor, 0);
    const upcomingVisitors = rows
      .filter((item) => item.visitDate >= tomorrow && ["PAID", "CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(item.reservationStatus))
      .reduce((sum, item) => sum + item.totalVisitor, 0);

    return {
      totalReservation: rows.length,
      waitingPayment: waitingRows.length,
      paidReservation: paidRows.length,
      reservationToday: todayRows.length,
      todayVisitor: todayVisitors,
      upcomingVisitor: upcomingVisitors,
      totalAmountPaid: paidRows.reduce((sum, item) => sum + item.totalAmount, 0)
    };
  }

  private async expirePendingReservations(): Promise<void> {
    const rows = await this.repository.findAll();
    const now = Date.now();
    for (const item of rows) {
      const waiting = item.paymentStatus === "WAITING_PAYMENT" && item.reservationStatus === "WAITING_PAYMENT";
      if (!waiting) {
        continue;
      }

      const ageMs = now - Date.parse(item.createdAt);
      if (ageMs < RESERVATION_EXPIRY_MINUTES * 60 * 1000) {
        continue;
      }

      await this.releaseQuota(item.ticketItems);
      await this.repository.update(item.id, {
        paymentStatus: "EXPIRED",
        reservationStatus: "CANCELLED",
        cancelledAt: new Date().toISOString()
      });
    }
  }

  private async validateAndNormalizeItems(visitDate: string, items: ReservationItemDto[]): Promise<ReservationItemDto[]> {
    const normalized: ReservationItemDto[] = [];
    for (const item of items) {
      const ticket = await this.ticketRepository.findById(item.ticketId);
      if (!ticket) {
        throw new ReservationServiceError(`Ticket not found: ${item.ticketId}`, 404);
      }
      if (!ticket.active) {
        throw new ReservationServiceError(`Ticket inactive: ${ticket.name}`, 409);
      }
      if (visitDate < ticket.validFrom || visitDate > ticket.validUntil) {
        throw new ReservationServiceError(`Visit date out of ticket range: ${ticket.name}`, 409);
      }
      if (item.qty > ticket.quota) {
        throw new ReservationServiceError(`Insufficient quota for ticket ${ticket.name}`, 409);
      }

      normalized.push({
        ticketId: ticket.id,
        ticketName: ticket.name,
        qty: item.qty,
        price: ticket.price,
        total: ticket.price * item.qty
      });
    }

    return normalized;
  }

  private async reserveQuota(items: ReservationItemDto[]): Promise<void> {
    for (const item of items) {
      const updated = await this.ticketRepository.decreaseQuota(item.ticketId, item.qty);
      if (!updated) {
        throw new ReservationServiceError(`Insufficient quota for ticket ${item.ticketName}`, 409);
      }
    }
  }

  private async releaseQuota(items: ReservationItemDto[]): Promise<void> {
    for (const item of items) {
      await this.ticketRepository.increaseQuota(item.ticketId, item.qty);
    }
  }

  private validateCreate(data: unknown): CreateReservationDto {
    if (!this.isRecord(data)) {
      throw new ReservationServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      customerName: this.requiredText(data.customerName, "customerName"),
      customerPhone: this.requiredText(data.customerPhone, "customerPhone"),
      customerEmail: this.requiredEmail(data.customerEmail, "customerEmail"),
      visitDate: this.requiredDate(data.visitDate, "visitDate"),
      visitSession: this.requiredText(data.visitSession, "visitSession"),
      paymentMethod: this.requiredPaymentMethod(data.paymentMethod),
      ticketItems: this.requiredItems(data.ticketItems)
    };
  }

  private validatePay(data: unknown): PayReservationDto {
    if (!this.isRecord(data)) {
      throw new ReservationServiceError("Invalid payload: body must be an object", 400);
    }
    return {
      paymentMethod: this.requiredPaymentMethod(data.paymentMethod)
    };
  }

  private requiredItems(value: unknown): ReservationItemDto[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new ReservationServiceError("Invalid payload: ticketItems must be a non-empty array", 400);
    }

    return value.map((item, index) => {
      if (!this.isRecord(item)) {
        throw new ReservationServiceError(`Invalid payload: ticketItems[${index}] must be an object`, 400);
      }

      const qty = this.requiredInteger(item.qty, `ticketItems[${index}].qty`);
      return {
        ticketId: this.requiredText(item.ticketId, `ticketItems[${index}].ticketId`),
        ticketName: typeof item.ticketName === "string" && item.ticketName.trim() ? item.ticketName.trim() : "-",
        qty,
        price: 0,
        total: 0
      };
    });
  }

  private requiredPaymentMethod(value: unknown): "CASH" | "QRIS" | "TRANSFER" {
    const method = this.requiredText(value, "paymentMethod").toUpperCase();
    if (!PAYMENT_METHODS.has(method)) {
      throw new ReservationServiceError("Invalid payload: paymentMethod must be CASH, QRIS, or TRANSFER", 400);
    }
    return method as "CASH" | "QRIS" | "TRANSFER";
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new ReservationServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredEmail(value: unknown, field: string): string {
    const email = this.requiredText(value, field);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ReservationServiceError(`Invalid payload: ${field} is invalid`, 400);
    }
    return email;
  }

  private requiredDate(value: unknown, field: string): string {
    const date = this.requiredText(value, field);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ReservationServiceError(`Invalid payload: ${field} must be YYYY-MM-DD`, 400);
    }
    return date;
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new ReservationServiceError(`Invalid payload: ${field} must be a positive integer`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private async generateBookingNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `RSV-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.repository.findByBookingNumber(candidate));

    return candidate;
  }

  private async generateSaleNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `SALE-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.ticketSaleRepository.findBySaleNumber(candidate));

    return candidate;
  }

  private async generateTicketNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `TKT-${y}${m}${d}-${String(counter).padStart(6, "0")}`;
      counter += 1;
    } while (await this.ticketSaleRepository.findByTicketNumber(candidate));

    return candidate;
  }

  private generateQrToken(): string {
    return randomUUID();
  }

  private buildQrSvg(payload: string): string {
    const safe = payload.replace(/[<>&"']/g, "");
    const chunks = safe.match(/.{1,28}/g) ?? [safe];
    const rows = chunks.length + 2;
    const height = Math.max(120, rows * 16 + 24);
    const lines = chunks
      .map((line, idx) => `<text x=\"12\" y=\"${36 + (idx * 16)}\" font-family=\"monospace\" font-size=\"11\">${line}</text>`)
      .join("");
    return `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"${height}\" viewBox=\"0 0 320 ${height}\" role=\"img\" aria-label=\"Reservation QR\"><rect width=\"320\" height=\"${height}\" fill=\"#ffffff\" stroke=\"#111827\"/><text x=\"12\" y=\"18\" font-family=\"monospace\" font-size=\"11\">SATSET RESERVATION QR</text>${lines}</svg>`;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private tomorrow(): string {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return now.toISOString().slice(0, 10);
  }
}
