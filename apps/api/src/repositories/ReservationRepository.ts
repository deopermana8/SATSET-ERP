import { randomUUID } from "node:crypto";

import type { CreateReservationDto, ReservationItemDto } from "../dto/ReservationDto.js";

export type ReservationPaymentStatus = "WAITING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED";
export type ReservationStatus = "NEW" | "WAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "VOID" | "CANCELLED";

export interface ReservationEntity {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  visitDate: string;
  visitSession: string;
  totalVisitor: number;
  totalAmount: number;
  paymentMethod: "CASH" | "QRIS" | "TRANSFER";
  paymentStatus: ReservationPaymentStatus;
  reservationStatus: ReservationStatus;
  ticketItems: ReservationItemDto[];
  qrToken: string;
  createdAt: string;
  paidAt?: string | null;
  confirmedAt?: string | null;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  ticketSaleId?: string | null;
  updatedAt: string;
}

export interface CreateReservationInput extends CreateReservationDto {
  bookingNumber: string;
  totalVisitor: number;
  totalAmount: number;
  qrToken: string;
}

export type UpdateReservationInput = Partial<
  Pick<ReservationEntity,
    | "paymentMethod"
    | "paymentStatus"
    | "reservationStatus"
    | "ticketItems"
    | "totalVisitor"
    | "totalAmount"
    | "paidAt"
    | "confirmedAt"
    | "checkedInAt"
    | "cancelledAt"
    | "ticketSaleId"
  >
>;

export class ReservationRepository {
  private readonly items = new Map<string, ReservationEntity>();

  async findAll(): Promise<ReservationEntity[]> {
    return [...this.items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<ReservationEntity | null> {
    for (const item of this.items.values()) {
      if (item.bookingNumber.toLowerCase() === bookingNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async findByQrToken(qrToken: string): Promise<ReservationEntity | null> {
    for (const item of this.items.values()) {
      if (item.qrToken === qrToken) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateReservationInput): Promise<ReservationEntity> {
    const now = new Date().toISOString();
    const created: ReservationEntity = {
      id: randomUUID(),
      bookingNumber: data.bookingNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      visitDate: data.visitDate,
      visitSession: data.visitSession,
      totalVisitor: data.totalVisitor,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: "WAITING_PAYMENT",
      reservationStatus: "WAITING_PAYMENT",
      ticketItems: data.ticketItems,
      qrToken: data.qrToken,
      createdAt: now,
      updatedAt: now,
      paidAt: null,
      confirmedAt: null,
      checkedInAt: null,
      cancelledAt: null,
      ticketSaleId: null
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateReservationInput): Promise<ReservationEntity | null> {
    const current = this.items.get(id);
    if (!current) {
      return null;
    }

    const updated: ReservationEntity = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }
}
