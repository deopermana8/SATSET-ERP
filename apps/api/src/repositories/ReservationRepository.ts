import type { CreateReservationDto, ReservationItemDto } from "../dto/ReservationDto.js";
import { prisma } from "../prismaClient.js";

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

type PrismaBookingRecord = {
  id: number;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  visitDate: string;
  visitSession: string;
  totalVisitor: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  reservationStatus: string;
  ticketItems: unknown;
  qrToken: string;
  paidAt: Date | null;
  confirmedAt: Date | null;
  checkedInAt: Date | null;
  cancelledAt: Date | null;
  ticketSaleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaBookingRecord): ReservationEntity {
  return {
    id: String(row.id),
    bookingNumber: row.bookingNumber,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    visitDate: row.visitDate,
    visitSession: row.visitSession,
    totalVisitor: row.totalVisitor,
    totalAmount: row.totalAmount,
    paymentMethod: row.paymentMethod as ReservationEntity["paymentMethod"],
    paymentStatus: row.paymentStatus as ReservationPaymentStatus,
    reservationStatus: row.reservationStatus as ReservationStatus,
    ticketItems: (Array.isArray(row.ticketItems) ? row.ticketItems : []) as ReservationItemDto[],
    qrToken: row.qrToken,
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    checkedInAt: row.checkedInAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    ticketSaleId: row.ticketSaleId ?? null,
    updatedAt: row.updatedAt.toISOString()
  };
}

export class ReservationRepository {
  async findAll(): Promise<ReservationEntity[]> {
    const rows = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => toEntity(row as PrismaBookingRecord));
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId)) return null;
    const row = await prisma.booking.findUnique({ where: { id: bookingId } });
    return row ? toEntity(row as PrismaBookingRecord) : null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<ReservationEntity | null> {
    const row = await prisma.booking.findUnique({ where: { bookingNumber } });
    return row ? toEntity(row as PrismaBookingRecord) : null;
  }

  async findByQrToken(qrToken: string): Promise<ReservationEntity | null> {
    const row = await prisma.booking.findUnique({ where: { qrToken } });
    return row ? toEntity(row as PrismaBookingRecord) : null;
  }

  async create(data: CreateReservationInput): Promise<ReservationEntity> {
    const row = await prisma.booking.create({
      data: {
        bookingNumber: data.bookingNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        visitDate: data.visitDate,
        visitSession: data.visitSession,
        totalVisitor: data.totalVisitor,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        ticketItems: data.ticketItems as never,
        qrToken: data.qrToken,
        updatedAt: new Date()
      }
    });
    return toEntity(row as PrismaBookingRecord);
  }

  async update(id: string, data: UpdateReservationInput): Promise<ReservationEntity | null> {
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId)) return null;
    const existing = await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentMethod: data.paymentMethod ?? undefined,
        paymentStatus: data.paymentStatus ?? undefined,
        reservationStatus: data.reservationStatus ?? undefined,
        ticketItems: data.ticketItems !== undefined ? (data.ticketItems as never) : undefined,
        totalVisitor: data.totalVisitor ?? undefined,
        totalAmount: data.totalAmount ?? undefined,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : undefined,
        checkedInAt: data.checkedInAt ? new Date(data.checkedInAt) : undefined,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : undefined,
        ticketSaleId: data.ticketSaleId ?? undefined,
        updatedAt: new Date()
      }
    });
    return toEntity(row as PrismaBookingRecord);
  }
}
