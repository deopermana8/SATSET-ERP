import { randomUUID } from "node:crypto";

import type { CreateTicketSaleDto, TicketSaleItemDto, UpdateTicketSaleDto } from "../dto/TicketSaleDto.js";

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
  private readonly items = new Map<string, TicketSaleEntity>();

  async findAll(): Promise<TicketSaleEntity[]> {
    return [...this.items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string): Promise<TicketSaleEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findBySaleNumber(saleNumber: string): Promise<TicketSaleEntity | null> {
    for (const item of this.items.values()) {
      if (item.saleNumber.toLowerCase() === saleNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async findByTicketNumber(ticketNumber: string): Promise<TicketSaleEntity | null> {
    for (const item of this.items.values()) {
      if (item.ticketNumber.toLowerCase() === ticketNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async findByQrToken(qrToken: string): Promise<TicketSaleEntity | null> {
    for (const item of this.items.values()) {
      if (item.qrToken === qrToken) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateTicketSaleDto): Promise<TicketSaleEntity> {
    const now = new Date().toISOString();
    const created: TicketSaleEntity = {
      id: randomUUID(),
      saleNumber: data.saleNumber ?? "",
      ticketNumber: data.ticketNumber ?? "",
      qrToken: data.qrToken ?? randomUUID(),
      shiftId: data.shiftId ?? "",
      cashierId: data.cashierId ?? "",
      cashierName: data.cashierName ?? "",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paymentMethod: data.paymentMethod as TicketSaleEntity["paymentMethod"],
      subtotal: data.subtotal ?? 0,
      discount: data.discount ?? 0,
      tax: data.tax ?? 0,
      total: data.total ?? 0,
      paidAmount: data.paidAmount ?? 0,
      changeAmount: data.changeAmount ?? 0,
      status: (data.status as TicketSaleEntity["status"] | undefined) ?? "NEW",
      soldAt: data.soldAt ?? now,
      printedAt: data.printedAt,
      checkedInAt: data.checkedInAt,
      voidedAt: data.voidedAt,
      paidAt: data.paidAt,
      items: data.items,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateTicketSaleDto): Promise<TicketSaleEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: TicketSaleEntity = {
      ...existing,
      ...data,
      paymentMethod: (data.paymentMethod as TicketSaleEntity["paymentMethod"] | undefined) ?? existing.paymentMethod,
      status: (data.status as TicketSaleEntity["status"] | undefined) ?? existing.status,
      items: data.items ?? existing.items,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
