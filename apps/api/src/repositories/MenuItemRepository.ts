import type { CreateMenuItemDto, UpdateMenuItemDto } from "../dto/MenuItemDto.js";
import { prisma } from "../prismaClient.js";

export interface MenuItemEntity {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type CafeMenuItemRecord = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  stock: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toMenuCode(id: number): string {
  return `MNU-${String(id).padStart(4, "0")}`;
}

function toEntity(row: CafeMenuItemRecord): MenuItemEntity {
  return {
    id: String(row.id),
    categoryId: String(row.categoryId),
    code: toMenuCode(row.id),
    name: row.name,
    price: row.price,
    stock: row.stock ?? 0,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export class MenuItemRepository {
  async findAll(): Promise<MenuItemEntity[]> {
    const rows = await prisma.cafeMenuItem.findMany({
      orderBy: [{ categoryId: "asc" }, { id: "asc" }],
      select: { id: true, categoryId: true, name: true, price: true, stock: true, active: true, createdAt: true, updatedAt: true }
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const menuItemId = Number(id);
    if (!Number.isInteger(menuItemId)) {
      return null;
    }

    const row = await prisma.cafeMenuItem.findUnique({
      where: { id: menuItemId },
      select: { id: true, categoryId: true, name: true, price: true, stock: true, active: true, createdAt: true, updatedAt: true }
    });
    return row ? toEntity(row) : null;
  }

  async findByCode(code: string): Promise<MenuItemEntity | null> {
    const normalized = code.trim().toUpperCase();
    const rows = await prisma.cafeMenuItem.findMany({
      select: { id: true, categoryId: true, name: true, price: true, stock: true, active: true, createdAt: true, updatedAt: true },
      orderBy: { id: "asc" }
    });
    return rows.map(toEntity).find((item) => item.code.toUpperCase() === normalized) ?? null;
  }

  async create(data: CreateMenuItemDto): Promise<MenuItemEntity> {
    const now = new Date();
    const row = await prisma.cafeMenuItem.create({
      data: {
        categoryId: Number(data.categoryId),
        name: data.name,
        price: data.price,
        stock: data.stock,
        active: data.active,
        updatedAt: now
      },
      select: { id: true, categoryId: true, name: true, price: true, stock: true, active: true, createdAt: true, updatedAt: true }
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateMenuItemDto): Promise<MenuItemEntity | null> {
    const menuItemId = Number(id);
    if (!Number.isInteger(menuItemId)) {
      return null;
    }

    const current = await prisma.cafeMenuItem.findUnique({ where: { id: menuItemId }, select: { id: true } });
    if (!current) {
      return null;
    }

    const row = await prisma.cafeMenuItem.update({
      where: { id: menuItemId },
      data: {
        categoryId: data.categoryId !== undefined ? Number(data.categoryId) : undefined,
        name: data.name,
        price: data.price,
        stock: data.stock,
        active: data.active
      },
      select: { id: true, categoryId: true, name: true, price: true, stock: true, active: true, createdAt: true, updatedAt: true }
    });
    return toEntity(row);
  }

  async decreaseStock(id: string, qty: number): Promise<MenuItemEntity | null> {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }
    if (current.stock < qty) {
      return null;
    }
    return this.update(id, { stock: current.stock - qty });
  }

  async increaseStock(id: string, qty: number): Promise<MenuItemEntity | null> {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    return this.update(id, { stock: current.stock + qty });
  }

  async delete(id: string): Promise<boolean> {
    return (await this.update(id, { active: false })) !== null;
  }
}
