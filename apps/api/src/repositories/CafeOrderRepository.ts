import { randomUUID } from "node:crypto";

import type { CafeOrderItemDto, CafePaymentMethod, CafeOrderType } from "../dto/CafeOrderDto.js";

export type CafeOrderPaymentStatus = "UNPAID" | "PAID" | "VOID";
export type CafeOrderStatus = "NEW" | "PAID" | "PRINTED" | "COMPLETED" | "VOID";

export interface CafeOrderEntity {
  id: string;
  orderNumber: string;
  cashierShiftId: string;
  customerName: string;
  tableNumber: string;
  orderType: CafeOrderType;
  paymentMethod: CafePaymentMethod;
  paymentStatus: CafeOrderPaymentStatus;
  status: CafeOrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: CafeOrderItemDto[];
  createdAt: string;
  paidAt?: string | null;
  printedAt?: string | null;
  completedAt?: string | null;
  voidedAt?: string | null;
  updatedAt: string;
}

export interface CreateCafeOrderInput {
  orderNumber: string;
  cashierShiftId: string;
  customerName: string;
  tableNumber: string;
  orderType: CafeOrderType;
  paymentMethod: CafePaymentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: CafeOrderItemDto[];
}

export type UpdateCafeOrderInput = Partial<
  Pick<CafeOrderEntity,
    | "paymentMethod"
    | "paymentStatus"
    | "status"
    | "paidAt"
    | "printedAt"
    | "completedAt"
    | "voidedAt"
  >
>;

export class CafeOrderRepository {
  private readonly items = new Map<string, CafeOrderEntity>();

  async findAll(): Promise<CafeOrderEntity[]> {
    return [...this.items.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<CafeOrderEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByOrderNumber(orderNumber: string): Promise<CafeOrderEntity | null> {
    for (const item of this.items.values()) {
      if (item.orderNumber.toLowerCase() === orderNumber.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateCafeOrderInput): Promise<CafeOrderEntity> {
    const now = new Date().toISOString();
    const created: CafeOrderEntity = {
      id: randomUUID(),
      orderNumber: data.orderNumber,
      cashierShiftId: data.cashierShiftId,
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      orderType: data.orderType,
      paymentMethod: data.paymentMethod,
      paymentStatus: "UNPAID",
      status: "NEW",
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount,
      total: data.total,
      items: data.items,
      createdAt: now,
      paidAt: null,
      printedAt: null,
      completedAt: null,
      voidedAt: null,
      updatedAt: now
    };

    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateCafeOrderInput): Promise<CafeOrderEntity | null> {
    const current = this.items.get(id);
    if (!current) {
      return null;
    }

    const updated: CafeOrderEntity = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }
}
