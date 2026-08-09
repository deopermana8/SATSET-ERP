import type { OpenCashierShiftDto, UpdateCashierShiftDto } from "../dto/CashierShiftDto.js";
import { prisma } from "../prismaClient.js";

export interface CashierShiftEntity {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string | null;
  openingCash: number;
  closingCash: number;
  cashSales: number;
  qrisSales: number;
  transferSales: number;
  ticketCount: number;
  status: "OPEN" | "CLOSED";
  difference: number;
  createdAt: string;
  updatedAt: string;
}

type PrismaCashierShiftRecord = {
  id: number;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  openedAt: Date;
  closedAt: Date | null;
  openingCash: number;
  closingCash: number;
  cashSales: number;
  qrisSales: number;
  transferSales: number;
  ticketCount: number;
  status: string;
  difference: number;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaCashierShiftRecord): CashierShiftEntity {
  return {
    id: String(row.id),
    shiftNumber: row.shiftNumber,
    cashierId: row.cashierId,
    cashierName: row.cashierName,
    openedAt: row.openedAt.toISOString(),
    closedAt: row.closedAt?.toISOString() ?? null,
    openingCash: row.openingCash,
    closingCash: row.closingCash,
    cashSales: row.cashSales,
    qrisSales: row.qrisSales,
    transferSales: row.transferSales,
    ticketCount: row.ticketCount,
    status: row.status.toUpperCase() as CashierShiftEntity["status"],
    difference: row.difference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class CashierShiftRepository {
  async findAll(): Promise<CashierShiftEntity[]> {
    const rows = await prisma.cashierShift.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => toEntity(row as PrismaCashierShiftRecord));
  }

  async findById(id: string): Promise<CashierShiftEntity | null> {
    const shiftId = Number(id);
    if (!Number.isInteger(shiftId)) return null;
    const row = await prisma.cashierShift.findUnique({ where: { id: shiftId } });
    return row ? toEntity(row as PrismaCashierShiftRecord) : null;
  }

  async findCurrentOpen(): Promise<CashierShiftEntity | null> {
    const row = await prisma.cashierShift.findFirst({
      where: { status: "OPEN" },
      orderBy: { openedAt: "desc" }
    });
    return row ? toEntity(row as PrismaCashierShiftRecord) : null;
  }

  async findByShiftNumber(shiftNumber: string): Promise<CashierShiftEntity | null> {
    const row = await prisma.cashierShift.findFirst({
      where: { shiftNumber: { equals: shiftNumber, mode: "insensitive" } }
    });
    return row ? toEntity(row as PrismaCashierShiftRecord) : null;
  }

  async create(data: OpenCashierShiftDto & { shiftNumber: string; openedAt: string }): Promise<CashierShiftEntity> {
    const row = await prisma.cashierShift.create({
      data: {
        shiftNumber: data.shiftNumber,
        cashierId: data.cashierId,
        cashierName: data.cashierName,
        openedAt: new Date(data.openedAt),
        openingCash: data.openingCash,
        updatedAt: new Date()
      }
    });
    return toEntity(row as PrismaCashierShiftRecord);
  }

  async update(id: string, data: UpdateCashierShiftDto): Promise<CashierShiftEntity | null> {
    const shiftId = Number(id);
    if (!Number.isInteger(shiftId)) return null;
    const existing = await prisma.cashierShift.findUnique({ where: { id: shiftId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: {
        closedAt: data.closedAt ? new Date(data.closedAt) : undefined,
        closingCash: data.closingCash ?? undefined,
        cashSales: data.cashSales ?? undefined,
        qrisSales: data.qrisSales ?? undefined,
        transferSales: data.transferSales ?? undefined,
        ticketCount: data.ticketCount ?? undefined,
        status: data.status ?? undefined,
        difference: data.difference ?? undefined,
        updatedAt: new Date()
      }
    });
    return toEntity(row as PrismaCashierShiftRecord);
  }
}
