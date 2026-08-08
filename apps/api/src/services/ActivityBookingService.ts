import { randomUUID } from "node:crypto";

import type { CreateActivityBookingDto, PayActivityBookingDto } from "../dto/ActivityBookingDto.js";
import { ReservationRepository } from "../repositories/ReservationRepository.js";
import { ActivityBookingRepository } from "../repositories/ActivityBookingRepository.js";
import type { ActivityBookingEntity } from "../repositories/ActivityBookingRepository.js";
import { ActivityRepository } from "../repositories/ActivityRepository.js";
import { ActivityScheduleRepository } from "../repositories/ActivityScheduleRepository.js";
import { ActivityScheduleService } from "./ActivityScheduleService.js";

const PAYMENT_METHODS = new Set(["CASH", "QRIS", "TRANSFER"]);

export class ActivityBookingServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ActivityBookingServiceError";
  }
}

export class ActivityBookingService {
  constructor(
    private readonly repository: ActivityBookingRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly scheduleRepository: ActivityScheduleRepository,
    private readonly scheduleService: ActivityScheduleService,
    private readonly reservationRepository: ReservationRepository
  ) {}

  async findAll(): Promise<ActivityBookingEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ActivityBookingEntity> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new ActivityBookingServiceError("Activity booking not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<ActivityBookingEntity> {
    const payload = this.validateCreate(data);
    const activity = await this.activityRepository.findById(payload.activityId);
    if (!activity) {
      throw new ActivityBookingServiceError("Activity not found", 404);
    }
    if (!activity.active) {
      throw new ActivityBookingServiceError("Activity is inactive", 409);
    }

    const schedule = await this.scheduleRepository.findById(payload.scheduleId);
    if (!schedule) {
      throw new ActivityBookingServiceError("Activity schedule not found", 404);
    }
    if (schedule.activityId !== payload.activityId) {
      throw new ActivityBookingServiceError("Schedule does not belong to selected activity", 409);
    }

    const reservation = await this.reservationRepository.findById(payload.reservationId);
    if (!reservation) {
      throw new ActivityBookingServiceError("Reservation not found", 404);
    }

    const duplicate = await this.repository.findActiveDuplicate(payload.reservationId, payload.activityId, payload.scheduleId);
    if (duplicate) {
      throw new ActivityBookingServiceError("Duplicate activity booking for this reservation and schedule", 409);
    }

    await this.scheduleService.reserveCapacity(payload.scheduleId, payload.qty);

    return this.repository.create({
      ...payload,
      customerName: payload.customerName || reservation.customerName,
      bookingNumber: await this.generateBookingNumber(),
      total: activity.price * payload.qty,
      paymentMethod: "CASH",
      qrToken: this.generateQrToken()
    });
  }

  async pay(id: string, data: unknown): Promise<ActivityBookingEntity> {
    const booking = await this.findById(id);
    if (booking.status !== "WAITING_PAYMENT") {
      throw new ActivityBookingServiceError("Activity booking is not waiting payment", 409);
    }

    const payload = this.validatePay(data);
    const updated = await this.repository.update(id, {
      status: "CONFIRMED",
      paymentMethod: payload.paymentMethod,
      paidAt: new Date().toISOString()
    });
    if (!updated) {
      throw new ActivityBookingServiceError("Activity booking not found", 404);
    }
    return updated;
  }

  async checkIn(id: string): Promise<ActivityBookingEntity> {
    const booking = await this.findById(id);
    if (booking.status === "CANCELLED") {
      throw new ActivityBookingServiceError("Cancelled booking cannot be checked in", 409);
    }
    if (booking.status === "CHECKED_IN" || booking.status === "COMPLETED") {
      throw new ActivityBookingServiceError("Activity booking already checked in", 409);
    }
    if (booking.status !== "CONFIRMED" && booking.status !== "PAID") {
      throw new ActivityBookingServiceError("Activity booking is not confirmed", 409);
    }

    const updated = await this.repository.update(id, {
      status: "CHECKED_IN",
      checkedInAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new ActivityBookingServiceError("Activity booking not found", 404);
    }

    const completed = await this.repository.update(id, {
      status: "COMPLETED"
    });
    if (!completed) {
      throw new ActivityBookingServiceError("Activity booking not found", 404);
    }

    return completed;
  }

  async cancel(id: string): Promise<ActivityBookingEntity> {
    const booking = await this.findById(id);
    if (booking.status === "CANCELLED") {
      throw new ActivityBookingServiceError("Activity booking already cancelled", 409);
    }
    if (booking.status === "CHECKED_IN" || booking.status === "COMPLETED") {
      throw new ActivityBookingServiceError("Checked-in booking cannot be cancelled", 409);
    }

    await this.scheduleService.releaseCapacity(booking.scheduleId, booking.qty);

    const updated = await this.repository.update(id, {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString()
    });
    if (!updated) {
      throw new ActivityBookingServiceError("Activity booking not found", 404);
    }
    return updated;
  }

  async getReport(): Promise<{
    totalBooking: number;
    waitingPayment: number;
    confirmed: number;
    checkedIn: number;
    completed: number;
    cancelled: number;
    bookedSlots: number;
    remainingCapacity: number;
    todayActivities: number;
    popularActivities: Array<{ activityId: string; activityName: string; totalQty: number }>;
    upcomingSessions: Array<{ scheduleId: string; activityId: string; date: string; session: string; available: number }>;
    daily: Array<{ date: string; booking: number; qty: number; revenue: number }>;
  }> {
    const bookings = await this.repository.findAll();
    const schedules = await this.scheduleRepository.findAll();
    const activities = await this.activityRepository.findAll();
    const activityMap = new Map(activities.map((item) => [item.id, item]));

    const today = this.today();
    const activeBookings = bookings.filter((item) => item.status !== "CANCELLED");

    const popularMap = new Map<string, number>();
    for (const item of activeBookings) {
      popularMap.set(item.activityId, (popularMap.get(item.activityId) || 0) + item.qty);
    }

    const popularActivities = [...popularMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activityId, totalQty]) => ({
        activityId,
        activityName: activityMap.get(activityId)?.name || "Unknown Activity",
        totalQty
      }));

    const upcomingSessions = schedules
      .filter((item) => item.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.session.localeCompare(b.session))
      .slice(0, 5)
      .map((item) => ({
        scheduleId: item.id,
        activityId: item.activityId,
        date: item.date,
        session: item.session,
        available: item.available
      }));

    const dailyMap = new Map<string, { booking: number; qty: number; revenue: number }>();
    for (const item of activeBookings) {
      const slot = await this.scheduleRepository.findById(item.scheduleId);
      const date = slot?.date || today;
      const acc = dailyMap.get(date) || { booking: 0, qty: 0, revenue: 0 };
      acc.booking += 1;
      acc.qty += item.qty;
      acc.revenue += item.total;
      dailyMap.set(date, acc);
    }

    const daily = [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, ...value }));

    return {
      totalBooking: bookings.length,
      waitingPayment: bookings.filter((item) => item.status === "WAITING_PAYMENT").length,
      confirmed: bookings.filter((item) => item.status === "CONFIRMED" || item.status === "PAID").length,
      checkedIn: bookings.filter((item) => item.status === "CHECKED_IN").length,
      completed: bookings.filter((item) => item.status === "COMPLETED").length,
      cancelled: bookings.filter((item) => item.status === "CANCELLED").length,
      bookedSlots: schedules.reduce((sum, item) => sum + item.booked, 0),
      remainingCapacity: schedules.reduce((sum, item) => sum + item.available, 0),
      todayActivities: schedules.filter((item) => item.date === today).length,
      popularActivities,
      upcomingSessions,
      daily
    };
  }

  async getQr(id: string): Promise<{ bookingNumber: string; qrToken: string; payload: string; svg: string }> {
    const booking = await this.findById(id);
    const payload = `SATSET:ACTIVITY:${booking.bookingNumber}:${booking.qrToken}`;
    return {
      bookingNumber: booking.bookingNumber,
      qrToken: booking.qrToken,
      payload,
      svg: this.buildQrSvg(payload)
    };
  }

  private validateCreate(data: unknown): CreateActivityBookingDto {
    if (!this.isRecord(data)) {
      throw new ActivityBookingServiceError("Invalid payload: body must be an object", 400);
    }

    return {
      reservationId: this.requiredText(data.reservationId, "reservationId"),
      customerName: this.requiredText(data.customerName, "customerName"),
      activityId: this.requiredText(data.activityId, "activityId"),
      scheduleId: this.requiredText(data.scheduleId, "scheduleId"),
      qty: this.requiredInteger(data.qty, "qty")
    };
  }

  private validatePay(data: unknown): PayActivityBookingDto {
    if (!this.isRecord(data)) {
      throw new ActivityBookingServiceError("Invalid payload: body must be an object", 400);
    }

    const paymentMethod = this.requiredText(data.paymentMethod, "paymentMethod").toUpperCase();
    if (!PAYMENT_METHODS.has(paymentMethod)) {
      throw new ActivityBookingServiceError("Invalid payload: paymentMethod must be CASH, QRIS, or TRANSFER", 400);
    }

    return {
      paymentMethod: paymentMethod as "CASH" | "QRIS" | "TRANSFER"
    };
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new ActivityBookingServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new ActivityBookingServiceError(`Invalid payload: ${field} must be a positive integer`, 400);
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
      candidate = `ACT-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.repository.findByBookingNumber(candidate));

    return candidate;
  }

  private generateQrToken(): string {
    return randomUUID();
  }

  private today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private buildQrSvg(payload: string): string {
    const escaped = payload
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">',
      '<rect width="240" height="240" fill="#ffffff"/>',
      '<rect x="12" y="12" width="216" height="216" fill="none" stroke="#111827" stroke-width="6"/>',
      '<text x="120" y="108" text-anchor="middle" font-size="12" font-family="monospace" fill="#111827">SATSET ACTIVITY</text>',
      `<text x="120" y="130" text-anchor="middle" font-size="10" font-family="monospace" fill="#111827">${escaped}</text>`,
      '</svg>'
    ].join("");
  }
}
