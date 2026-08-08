import { randomUUID } from "node:crypto";

import type { PurchaseOrderItemDto, PurchaseOrderStatus } from "../dto/PurchaseOrderDto.js";
import { prisma } from "../prismaClient.js";

export interface PurchaseOrderEntity {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemDto[];
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderInput {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemDto[];
  subtotal: number;
  total: number;
}

export type UpdatePurchaseOrderInput = Partial<
  Pick<PurchaseOrderEntity, "status" | "updatedAt">
>;

type PurchaseOrderRecord = {
  id: number;
  poNumber: string;
  supplierId: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  supplier: { name: string };
  purchaseOrderItems: Array<{
    itemId: number;
    quantity: number;
    unitCost: number;
    subtotal: number;
    inventoryItem: { name: string };
  }>;
};

function toEntity(row: PurchaseOrderRecord): PurchaseOrderEntity {
  return {
    id: String(row.id),
    poNumber: row.poNumber,
    supplierId: String(row.supplierId),
    supplierName: row.supplier.name,
    status: String(row.status || "DRAFT").toUpperCase() as PurchaseOrderStatus,
    items: row.purchaseOrderItems.map((item) => ({
      inventoryId: String(item.itemId),
      inventoryName: item.inventoryItem.name,
      qty: item.quantity,
      unitCost: item.unitCost,
      total: item.subtotal
    })),
    subtotal: row.totalAmount,
    total: row.totalAmount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class PurchaseOrderRepository {
  async findAll(): Promise<PurchaseOrderEntity[]> {
    const rows = await prisma.purchaseOrder.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        supplier: { select: { name: true } },
        purchaseOrderItems: {
          include: { inventoryItem: { select: { name: true } } }
        }
      }
    });
    return rows.map((row) => toEntity(row as PurchaseOrderRecord));
  }

  async findById(id: string): Promise<PurchaseOrderEntity | null> {
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) {
      return null;
    }

    const row = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: {
        supplier: { select: { name: true } },
        purchaseOrderItems: {
          include: { inventoryItem: { select: { name: true } } }
        }
      }
    });
    return row ? toEntity(row as PurchaseOrderRecord) : null;
  }

  async findByPoNumber(poNumber: string): Promise<PurchaseOrderEntity | null> {
    const row = await prisma.purchaseOrder.findFirst({
      where: { poNumber },
      include: {
        supplier: { select: { name: true } },
        purchaseOrderItems: {
          include: { inventoryItem: { select: { name: true } } }
        }
      }
    });
    return row ? toEntity(row as PurchaseOrderRecord) : null;
  }

  async create(data: CreatePurchaseOrderInput): Promise<PurchaseOrderEntity> {
    const row = await prisma.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        supplierId: Number(data.supplierId),
        status: data.status,
        totalAmount: data.total,
        orderedAt: new Date(),
        updatedAt: new Date(),
        purchaseOrderItems: {
          create: data.items.map((item) => ({
            itemId: Number(item.inventoryId),
            quantity: item.qty,
            unitCost: item.unitCost,
            subtotal: item.total,
            received: 0
          }))
        }
      },
      include: {
        supplier: { select: { name: true } },
        purchaseOrderItems: {
          include: { inventoryItem: { select: { name: true } } }
        }
      }
    });
    return toEntity(row as PurchaseOrderRecord);
  }

  async update(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderEntity | null> {
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) {
      return null;
    }

    const existing = await prisma.purchaseOrder.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!existing) {
      return null;
    }

    const nextStatus = data.status?.toUpperCase();
    const row = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        updatedAt: new Date(),
        receivedAt: nextStatus === "RECEIVED" ? new Date() : undefined
      },
      include: {
        supplier: { select: { name: true } },
        purchaseOrderItems: {
          include: { inventoryItem: { select: { name: true } } }
        }
      }
    });
    return toEntity(row as PurchaseOrderRecord);
  }
}
