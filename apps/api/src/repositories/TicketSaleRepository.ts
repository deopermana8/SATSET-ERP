import { randomUUID } from "node:crypto";

import type { CreateTicketSaleDto, TicketSaleItemDto, UpdateTicketSaleDto } from "../dto/TicketSaleDto.js";
import { prisma } from "../prismaClient.js";

export interface TicketSaleEntity {
  id: string;
  saleNumber: string;
  ticketNumber: string;
  qrToken: string;
  shiftId: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: "CASH" | "QRIS" | "TRANSFER";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  status: "NEW" | "PAID" | "PRINTED" | "CHECKED_IN" | "VOID";
  soldAt: string;
  printedAt?: string | null;
  checkedInAt?: string | null;
  voidedAt?: string | null;
  paidAt?: string | null;
  items: TicketSaleItemDto[];
  createdAt: string;
  updatedAt: string;
}

export class TicketSaleRepository {
  // Prisma persistence — in-memory storage removed

  async findAll(): Promise<TicketSaleEntity[]> {
    const rows = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { transactionItems: true }
    });

    return rows.map((row) => ({
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: row.transactionItems[0]?.qrToken ?? "",
      qrToken: row.transactionItems[0]?.qrToken ?? "",
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: "",
      customerPhone: "",
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((item) => ({
        ticketId: String(item.ticketId),
        ticketName: item.ticketName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    }));
  }

  async findById(id: string): Promise<TicketSaleEntity | null> {
    const row = await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: { transactionItems: true }
    });

    if (!row) return null;

    return {
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: row.transactionItems[0]?.qrToken ?? "",
      qrToken: row.transactionItems[0]?.qrToken ?? "",
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: "",
      customerPhone: "",
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((item) => ({
        ticketId: String(item.ticketId),
        ticketName: item.ticketName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    };
  }

  async findBySaleNumber(saleNumber: string): Promise<TicketSaleEntity | null> {
    const row = await prisma.transaction.findUnique({
      where: { invoiceNo: saleNumber },
      include: { transactionItems: true }
    });

    if (!row) return null;

    return {
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: row.transactionItems[0]?.qrToken ?? "",
      qrToken: row.transactionItems[0]?.qrToken ?? "",
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: "",
      customerPhone: "",
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((item) => ({
        ticketId: String(item.ticketId),
        ticketName: item.ticketName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    };
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketSaleEntity | null> {
    const item = await prisma.transactionItem.findUnique({
      where: { qrToken: ticketNumber },
      include: { transaction: { include: { transactionItems: true } } }
    });

    if (!item) return null;

    const row = item.transaction;

    return {
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: item.qrToken,
      qrToken: item.qrToken,
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: "",
      customerPhone: "",
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((x) => ({
        ticketId: String(x.ticketId),
        ticketName: x.ticketName,
        qty: x.quantity,
        price: x.unitPrice,
        total: x.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    };
  }

  async findByQrToken(qrToken: string): Promise<TicketSaleEntity | null> {
    const item = await prisma.transactionItem.findUnique({
      where: { qrToken },
      include: { transaction: { include: { transactionItems: true } } }
    });

    if (!item) return null;

    const row = item.transaction;

    return {
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: item.qrToken,
      qrToken: item.qrToken,
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: "",
      customerPhone: "",
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((x) => ({
        ticketId: String(x.ticketId),
        ticketName: x.ticketName,
        qty: x.quantity,
        price: x.unitPrice,
        total: x.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    };
  }

  async create(data: CreateTicketSaleDto): Promise<TicketSaleEntity> {
    const soldAt = data.soldAt ? new Date(data.soldAt) : new Date();

    // cashierId is optional; non-integer identifiers (e.g. "CSH-001") are stored as null
    const cashierIdNum = Number(data.cashierId);
    const cashierId = data.cashierId && Number.isInteger(cashierIdNum) ? cashierIdNum : null;
    const shiftIdNum = Number(data.shiftId);
    const shiftId = data.shiftId && Number.isInteger(shiftIdNum) ? shiftIdNum : null;

    const transactionItems = await Promise.all(
      data.items.map(async (item) => {
        const ticketId = Number(item.ticketId);

        if (!Number.isInteger(ticketId)) {
          throw new Error(`Invalid ticketId: ${item.ticketId}`);
        }

        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId }
        });

        if (!ticket) {
          throw new Error(`Ticket not found: ${item.ticketId}`);
        }

        return {
          ticketId,
          ticketName: item.ticketName || ticket.name,
          ticketType: ticket.type,
          unitPrice: item.price,
          quantity: item.qty,
          subtotal: item.total,
          qrToken: randomUUID(),
          qrExpiresAt: new Date(
            soldAt.getTime() + 24 * 60 * 60 * 1000
          )
        };
      })
    );

    const row = await prisma.transaction.create({
      data: {
        invoiceNo: data.saleNumber ?? "",
        status: data.status ?? "NEW",
        subtotal: data.subtotal ?? 0,
        discount: data.discount ?? 0,
        tax: data.tax ?? 0,
        total: data.total ?? 0,
        paymentMethod: data.paymentMethod,
        cashReceived: data.paidAmount ?? 0,
        cashChange: data.changeAmount ?? 0,
        cashierId,
        cashierName: data.cashierName ?? "",
        shiftId,
        createdAt: soldAt,
        transactionItems: {
          create: transactionItems
        }
      },
      include: {
        transactionItems: true
      }
    });

    const firstItem = row.transactionItems[0];

    return {
      id: String(row.id),
      saleNumber: row.invoiceNo,
      ticketNumber: firstItem?.qrToken ?? "",
      qrToken: firstItem?.qrToken ?? "",
      shiftId: row.shiftId ? String(row.shiftId) : "",
      cashierId: String(row.cashierId),
      cashierName: row.cashierName,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: row.subtotal,
      discount: row.discount,
      tax: row.tax,
      total: row.total,
      paidAmount: row.cashReceived ?? 0,
      changeAmount: row.cashChange ?? 0,
      status: row.status as TicketSaleEntity["status"],
      soldAt: row.createdAt.toISOString(),
      items: row.transactionItems.map((item) => ({
        ticketId: String(item.ticketId),
        ticketName: item.ticketName,
        qty: item.quantity,
        price: item.unitPrice,
        total: item.subtotal
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.createdAt.toISOString()
    };
  }

  async update(id: string, data: UpdateTicketSaleDto): Promise<TicketSaleEntity | null> {
  const existing = await prisma.transaction.findUnique({
    where: { id: Number(id) },
    include: { transactionItems: true }
  });

  if (!existing) {
    return null;
  }

  const row = await prisma.transaction.update({
    where: { id: Number(id) },
    data: {
      invoiceNo: data.saleNumber ?? undefined,
      paymentMethod: data.paymentMethod ?? undefined,
      cashReceived: data.paidAmount ?? undefined,
      cashChange: data.changeAmount ?? undefined,
      status: data.status?.toLowerCase() ?? undefined
    },
    include: { transactionItems: true }
  });

  return {
    id: String(row.id),
    saleNumber: row.invoiceNo,
    ticketNumber: row.transactionItems[0]?.qrToken ?? "",
    qrToken: row.transactionItems[0]?.qrToken ?? "",
    shiftId: row.shiftId != null ? String(row.shiftId) : "",
    cashierId: String(row.cashierId),
    cashierName: row.cashierName,
    customerName: "",
    customerPhone: "",
    paymentMethod: row.paymentMethod as TicketSaleEntity["paymentMethod"],
    subtotal: row.subtotal,
    discount: row.discount,
    tax: row.tax,
    total: row.total,
    paidAmount: row.cashReceived ?? 0,
    changeAmount: row.cashChange ?? 0,
    status: row.status.toUpperCase() as TicketSaleEntity["status"],
    soldAt: row.createdAt.toISOString(),
    printedAt: null,
    checkedInAt: null,
    voidedAt: null,
    paidAt: row.status.toLowerCase() === "paid" ? row.createdAt.toISOString() : null,
    items: row.transactionItems.map((item) => ({
      ticketId: String(item.ticketId),
      ticketName: item.ticketName,
      qty: item.quantity,
      price: item.unitPrice,
      total: item.subtotal
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString()
  };
}

async delete(id: string): Promise<boolean> {
  const existing = await prisma.transaction.findUnique({
    where: { id: Number(id) }
  });

  if (!existing) {
    return false;
  }

  await prisma.transaction.delete({
    where: { id: Number(id) }
  });

  return true;
}
}







