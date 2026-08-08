import type { CreateMenuCategoryDto } from "../dto/MenuCategoryDto.js";
import { prisma } from "../prismaClient.js";

export interface MenuCategoryEntity {
  id: string;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type CafeCategoryRecord = {
  id: number;
  name: string;
  active: boolean;
  createdAt: Date;
};

function toCategoryCode(id: number): string {
  return `CAT-${String(id).padStart(4, "0")}`;
}

function toEntity(row: CafeCategoryRecord): MenuCategoryEntity {
  return {
    id: String(row.id),
    code: toCategoryCode(row.id),
    name: row.name,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString()
  };
}

export class MenuCategoryRepository {
  async findAll(): Promise<MenuCategoryEntity[]> {
    const rows = await prisma.cafeCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, name: true, active: true, createdAt: true }
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<MenuCategoryEntity | null> {
    const categoryId = Number(id);
    if (!Number.isInteger(categoryId)) {
      return null;
    }

    const row = await prisma.cafeCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, active: true, createdAt: true }
    });
    return row ? toEntity(row) : null;
  }

  async findByCode(code: string): Promise<MenuCategoryEntity | null> {
    const normalized = code.trim().toUpperCase();
    const rows = await prisma.cafeCategory.findMany({
      select: { id: true, name: true, active: true, createdAt: true },
      orderBy: { id: "asc" }
    });
    return rows.map(toEntity).find((item) => item.code.toUpperCase() === normalized) ?? null;
  }

  async create(data: CreateMenuCategoryDto): Promise<MenuCategoryEntity> {
    const row = await prisma.cafeCategory.create({
      data: {
        name: data.name,
        active: data.active
      },
      select: { id: true, name: true, active: true, createdAt: true }
    });
    return toEntity(row);
  }
}
