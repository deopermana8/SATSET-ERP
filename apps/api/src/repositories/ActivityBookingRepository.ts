import { randomUUID } from "node:crypto";

import type { CreateActivityBookingDto } from "../dto/ActivityBookingDto.js";

export type ActivityBookingPaymentMethod = "CASH" | "QRIS" | "TRANSFER";
export type ActivityBookingStatus = "WAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";

export interface ActivityBookingEntity {
  id: string;
  bookingNumber: string;
  reservationId: string;
  customerName: string;
  activityId: string;
  scheduleId: string;
  qty: number;
  total: number;
  status: ActivityBookingStatus;
  paymentMethod: ActivityBookingPaymentMethod;
  qrToken: string;
  createdAt: string;
  paidAt?: string | null;
  checkedInAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  updatedAt: string;
}

export interface CreateActivityBookingInput extends CreateActivityBookingDto {
  bookingNumber: string;
  total: number;
  paymentMethod: ActivityBookingPaymentMethod;
  qrToken: string;
}

export type UpdateActivityBookingInput = Partial<
  Pick<ActivityBookingEntity,
    | "status"
    | "paymentMethod"
    | "paidAt"
    | "checkedInAt"
    | "completedAt"
    | "cancelledAt"
  >
>;

export class ActivityBookingRepository {
  private readonly items = new Map<string, ActivityBookingEntity>();

  async findAll(): Promise<ActivityBookingEntity[]> {
    return [...this.items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ActivityBookingEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<ActivityBookingEntity | null> {
    for (const item of this.items.values()) {
      if (item.bookingNumber.toLowerCase() === bookingNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async findActiveDuplicate(reservationId: string, activityId: string, scheduleId: string): Promise<ActivityBookingEntity | null> {
    for (const item of this.items.values()) {
      const same = item.reservationId === reservationId && item.activityId === activityId && item.scheduleId === scheduleId;
      if (same && item.status !== "CANCELLED") {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateActivityBookingInput): Promise<ActivityBookingEntity> {
    const now = new Date().toISOString();
    const created: ActivityBookingEntity = {
      id: randomUUID(),
      bookingNumber: data.bookingNumber,
      reservationId: data.reservationId,
      customerName: data.customerName,
      activityId: data.activityId,
      scheduleId: data.scheduleId,
      qty: data.qty,
      total: data.total,
      status: "WAITING_PAYMENT",
      paymentMethod: data.paymentMethod,
      qrToken: data.qrToken,
      createdAt: now,
      paidAt: null,
      checkedInAt: null,
      completedAt: null,
      cancelledAt: null,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateActivityBookingInput): Promise<ActivityBookingEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: ActivityBookingEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }
}
