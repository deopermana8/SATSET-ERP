import type { CreateInventoryDto, UpdateInventoryDto } from "../dto/InventoryDto.js";
import { prisma } from "../prismaClient.js";

export interface InventoryEntity {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  minimumStock: number;
  currentStock: number;
  averageCost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type InventoryItemRecord = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  category: string | null;
  minStock: number;
  currentStock: number;
  cost: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: InventoryItemRecord): InventoryEntity {
  return {
    id: String(row.id),
    code: row.sku,
    name: row.name,
    unit: row.unit,
    category: row.category ?? "",
    minimumStock: row.minStock,
    currentStock: row.currentStock,
    averageCost: row.cost,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class InventoryRepository {
  async findAll(): Promise<InventoryEntity[]> {
    const rows = await prisma.inventoryItem.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, sku: true, name: true, unit: true, category: true, minStock: true, currentStock: true, cost: true, active: true, createdAt: true, updatedAt: true }
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<InventoryEntity | null> {
    const inventoryId = Number(id);
    if (!Number.isInteger(inventoryId)) {
      return null;
    }

    const row = await prisma.inventoryItem.findUnique({
      where: { id: inventoryId },
      select: { id: true, sku: true, name: true, unit: true, category: true, minStock: true, currentStock: true, cost: true, active: true, createdAt: true, updatedAt: true }
    });
    return row ? toEntity(row) : null;
  }

  async findByCode(code: string): Promise<InventoryEntity | null> {
    const row = await prisma.inventoryItem.findUnique({
      where: { sku: code },
      select: { id: true, sku: true, name: true, unit: true, category: true, minStock: true, currentStock: true, cost: true, active: true, createdAt: true, updatedAt: true }
    });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateInventoryDto): Promise<InventoryEntity> {
    const now = new Date();
    const row = await prisma.inventoryItem.create({
      data: {
        sku: data.code,
        name: data.name,
        unit: data.unit,
        category: data.category || null,
        minStock: data.minimumStock,
        currentStock: data.currentStock,
        cost: data.averageCost,
        active: data.active,
        updatedAt: now
      },
      select: { id: true, sku: true, name: true, unit: true, category: true, minStock: true, currentStock: true, cost: true, active: true, createdAt: true, updatedAt: true }
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateInventoryDto): Promise<InventoryEntity | null> {
    const inventoryId = Number(id);
    if (!Number.isInteger(inventoryId)) {
      return null;
    }

    const existing = await prisma.inventoryItem.findUnique({ where: { id: inventoryId }, select: { id: true } });
    if (!existing) {
      return null;
    }

    const row = await prisma.inventoryItem.update({
      where: { id: inventoryId },
      data: {
        sku: data.code,
        name: data.name,
        unit: data.unit,
        category: data.category !== undefined ? (data.category || null) : undefined,
        minStock: data.minimumStock,
        currentStock: data.currentStock,
        cost: data.averageCost,
        active: data.active
      },
      select: { id: true, sku: true, name: true, unit: true, category: true, minStock: true, currentStock: true, cost: true, active: true, createdAt: true, updatedAt: true }
    });
    return toEntity(row);
  }
}
