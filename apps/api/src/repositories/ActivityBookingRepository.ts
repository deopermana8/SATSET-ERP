import type { CreateActivityBookingDto } from "../dto/ActivityBookingDto.js";
import { prisma } from "../prismaClient.js";

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
  Pick<
    ActivityBookingEntity,
    | "status"
    | "paymentMethod"
    | "paidAt"
    | "checkedInAt"
    | "completedAt"
    | "cancelledAt"
  >
>;

type PrismaBookingRow = {
  id: number;
  bookingNumber: string;
  reservationId: string;
  customerName: string;
  activityId: string;
  scheduleId: string;
  qty: number;
  total: number;
  status: string;
  paymentMethod: string;
  qrToken: string;
  paidAt: Date | null;
  checkedInAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaBookingRow): ActivityBookingEntity {
  return {
    id: String(row.id),
    bookingNumber: row.bookingNumber,
    reservationId: row.reservationId,
    customerName: row.customerName,
    activityId: row.activityId,
    scheduleId: row.scheduleId,
    qty: row.qty,
    total: row.total,
    status: row.status as ActivityBookingStatus,
    paymentMethod: row.paymentMethod as ActivityBookingPaymentMethod,
    qrToken: row.qrToken,
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    checkedInAt: row.checkedInAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ActivityBookingRepository {
  async findAll(): Promise<ActivityBookingEntity[]> {
    const rows = await prisma.activityBooking.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => toEntity(row as PrismaBookingRow));
  }

  async findById(id: string): Promise<ActivityBookingEntity | null> {
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId)) return null;
    const row = await prisma.activityBooking.findUnique({ where: { id: bookingId } });
    return row ? toEntity(row as PrismaBookingRow) : null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<ActivityBookingEntity | null> {
    const row = await prisma.activityBooking.findFirst({
      where: { bookingNumber: { equals: bookingNumber, mode: "insensitive" } },
    });
    return row ? toEntity(row as PrismaBookingRow) : null;
  }

  async findActiveDuplicate(reservationId: string, activityId: string, scheduleId: string): Promise<ActivityBookingEntity | null> {
    const row = await prisma.activityBooking.findFirst({
      where: { reservationId, activityId, scheduleId, NOT: { status: "CANCELLED" } },
    });
    return row ? toEntity(row as PrismaBookingRow) : null;
  }

  async create(data: CreateActivityBookingInput): Promise<ActivityBookingEntity> {
    const row = await prisma.activityBooking.create({
      data: {
        bookingNumber: data.bookingNumber,
        reservationId: data.reservationId,
        customerName: data.customerName,
        activityId: data.activityId,
        scheduleId: data.scheduleId,
        qty: data.qty,
        total: data.total,
        paymentMethod: data.paymentMethod,
        qrToken: data.qrToken,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaBookingRow);
  }

  async update(id: string, data: UpdateActivityBookingInput): Promise<ActivityBookingEntity | null> {
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId)) return null;
    const existing = await prisma.activityBooking.findUnique({ where: { id: bookingId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.activityBooking.update({
      where: { id: bookingId },
      data: {
        status: data.status ?? undefined,
        paymentMethod: data.paymentMethod ?? undefined,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        checkedInAt: data.checkedInAt ? new Date(data.checkedInAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : undefined,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaBookingRow);
  }
}
