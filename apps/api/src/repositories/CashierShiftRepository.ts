import { randomUUID } from "node:crypto";

import type { OpenCashierShiftDto, UpdateCashierShiftDto } from "../dto/CashierShiftDto.js";

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

export class CashierShiftRepository {
  private readonly items = new Map<string, CashierShiftEntity>();

  async findAll(): Promise<CashierShiftEntity[]> {
    return [...this.items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<CashierShiftEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findCurrentOpen(): Promise<CashierShiftEntity | null> {
    for (const item of this.items.values()) {
      if (item.status === "OPEN") {
        return item;
      }
    }
    return null;
  }

  async findByShiftNumber(shiftNumber: string): Promise<CashierShiftEntity | null> {
    for (const item of this.items.values()) {
      if (item.shiftNumber.toLowerCase() === shiftNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: OpenCashierShiftDto & { shiftNumber: string; openedAt: string }): Promise<CashierShiftEntity> {
    const now = new Date().toISOString();
    const created: CashierShiftEntity = {
      id: randomUUID(),
      shiftNumber: data.shiftNumber,
      cashierId: data.cashierId,
      cashierName: data.cashierName,
      openedAt: data.openedAt,
      closedAt: null,
      openingCash: data.openingCash,
      closingCash: 0,
      cashSales: 0,
      qrisSales: 0,
      transferSales: 0,
      ticketCount: 0,
      status: "OPEN",
      difference: 0,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateCashierShiftDto): Promise<CashierShiftEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: CashierShiftEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updated);
    return updated;
  }
}
