import type { CreateTicketDto, UpdateTicketDto } from "../dto/TicketDto.js";
import { prisma } from "../prismaClient.js";

export interface TicketEntity {
  id: string;
  code: string;
  name: string;
  category: "REGULAR" | "VIP" | "ROMBONGAN";
  price: number;
  quota: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const TICKET_SELECT = {
  id: true,
  code: true,
  name: true,
  type: true,
  price: true,
  quota: true,
  validFrom: true,
  validUntil: true,
  active: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true
} as const;

type PrismaTicketRecord = {
  id: number;
  code: string;
  name: string;
  type: string;
  price: number;
  quota: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaTicketRecord): TicketEntity {
  return {
    id: String(row.id),
    code: row.code,
    name: row.name,
    // type maps to category enum for runtime contract
    category: row.type as TicketEntity["category"],
    price: row.price,
    quota: row.quota,
    validFrom: row.validFrom.toISOString().slice(0, 10),
    validUntil: row.validUntil.toISOString().slice(0, 10),
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class TicketRepository {
  async findAll(): Promise<TicketEntity[]> {
    const rows = await prisma.ticket.findMany({
      where: { deletedAt: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: TICKET_SELECT
    });
    return rows.map((row) => toEntity(row as PrismaTicketRecord));
  }

  async findById(id: string): Promise<TicketEntity | null> {
    const ticketId = Number(id);
    if (!Number.isInteger(ticketId)) return null;
    const row = await prisma.ticket.findFirst({
      where: { id: ticketId, deletedAt: null },
      select: TICKET_SELECT
    });
    return row ? toEntity(row as PrismaTicketRecord) : null;
  }

  async findByCode(code: string): Promise<TicketEntity | null> {
    const row = await prisma.ticket.findFirst({
      where: { code: { equals: code.trim(), mode: "insensitive" }, deletedAt: null },
      select: TICKET_SELECT
    });
    return row ? toEntity(row as PrismaTicketRecord) : null;
  }

  async create(data: CreateTicketDto): Promise<TicketEntity> {
    const now = new Date();
    const row = await prisma.ticket.create({
      data: {
        code: data.code,
        name: data.name,
        // category from runtime contract stored as type in DB
        type: data.category,
        price: data.price,
        quota: data.quota,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        active: data.active,
        updatedAt: now
      },
      select: TICKET_SELECT
    });
    return toEntity(row as PrismaTicketRecord);
  }

  async update(id: string, data: UpdateTicketDto): Promise<TicketEntity | null> {
    const ticketId = Number(id);
    if (!Number.isInteger(ticketId)) return null;
    const existing = await prisma.ticket.findFirst({ where: { id: ticketId, deletedAt: null }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        code: data.code,
        name: data.name,
        type: data.category,
        price: data.price,
        quota: data.quota,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        active: data.active,
        updatedAt: new Date()
      },
      select: TICKET_SELECT
    });
    return toEntity(row as PrismaTicketRecord);
  }

  /** Atomic decrement only when quota >= qty; returns null if insufficient. */
  async decreaseQuota(id: string, qty: number): Promise<TicketEntity | null> {
    const ticketId = Number(id);
    if (!Number.isInteger(ticketId)) return null;
    try {
      const row = await prisma.ticket.update({
        where: { id: ticketId, quota: { gte: qty }, deletedAt: null },
        data: { quota: { decrement: qty }, updatedAt: new Date() },
        select: TICKET_SELECT
      });
      return toEntity(row as PrismaTicketRecord);
    } catch {
      // update matched 0 rows — quota insufficient or ticket not found
      return null;
    }
  }

  async increaseQuota(id: string, qty: number): Promise<TicketEntity | null> {
    const ticketId = Number(id);
    if (!Number.isInteger(ticketId)) return null;
    const existing = await prisma.ticket.findFirst({ where: { id: ticketId, deletedAt: null }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.ticket.update({
      where: { id: ticketId },
      data: { quota: { increment: qty }, updatedAt: new Date() },
      select: TICKET_SELECT
    });
    return toEntity(row as PrismaTicketRecord);
  }

  /** Soft delete via deletedAt timestamp. */
  async delete(id: string): Promise<boolean> {
    const ticketId = Number(id);
    if (!Number.isInteger(ticketId)) return false;
    const existing = await prisma.ticket.findFirst({ where: { id: ticketId, deletedAt: null }, select: { id: true } });
    if (!existing) return false;
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { deletedAt: new Date(), updatedAt: new Date() }
    });
    return true;
  }
}
