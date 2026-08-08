import { randomUUID } from "node:crypto";

import type { StockMovementQueryDto } from "../dto/StockMovementQueryDto.js";
import type { StockMovementType } from "../dto/StockMovementDto.js";
import { prisma } from "../prismaClient.js";

export interface StockMovementEntity {
  id: string;
  inventoryId: string;
  movementType: StockMovementType;
  qty: number;
  balance: number;
  reference: string;
  createdAt: string;
}

export interface CreateStockMovementInput {
  inventoryId: string;
  movementType: StockMovementType;
  qty: number;
  balance: number;
  reference: string;
}

type StockMovementRecord = {
  id: number;
  itemId: number;
  type: string;
  quantity: number;
  reference: string | null;
  createdAt: Date;
  inventoryItem: { currentStock: number };
};

function toEntity(row: StockMovementRecord): StockMovementEntity {
  return {
    id: String(row.id),
    inventoryId: String(row.itemId),
    movementType: String(row.type).toUpperCase() as StockMovementType,
    qty: row.quantity,
    balance: row.inventoryItem.currentStock,
    reference: row.reference ?? "",
    createdAt: row.createdAt.toISOString()
  };
}

export class StockMovementRepository {
  async findAll(): Promise<StockMovementEntity[]> {
    const rows = await prisma.stockMovement.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { inventoryItem: { select: { currentStock: true } } }
    });
    return rows.map((row) => toEntity(row as StockMovementRecord));
  }

  async findByQuery(query: StockMovementQueryDto): Promise<StockMovementEntity[]> {
    const rows = await prisma.stockMovement.findMany({
      where: {
        itemId: query.inventoryId ? Number(query.inventoryId) : undefined,
        type: query.movementType,
        reference: query.reference ? { contains: query.reference } : undefined,
        createdAt: query.from || query.to ? {
          gte: query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined,
          lte: query.to ? new Date(`${query.to}T23:59:59.999Z`) : undefined
        } : undefined
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { inventoryItem: { select: { currentStock: true } } }
    });
    return rows.map((row) => toEntity(row as StockMovementRecord));
  }

  async create(data: CreateStockMovementInput): Promise<StockMovementEntity> {
    const row = await prisma.stockMovement.create({
      data: {
        itemId: Number(data.inventoryId),
        type: data.movementType,
        quantity: data.qty,
        unitCost: 0,
        reference: data.reference,
        createdAt: new Date()
      },
      include: { inventoryItem: { select: { currentStock: true } } }
    });
    return toEntity(row as StockMovementRecord);
  }
}
