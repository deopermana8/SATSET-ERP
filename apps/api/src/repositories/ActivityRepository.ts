import type { CreateActivityDto, UpdateActivityDto } from "../dto/ActivityDto.js";
import { prisma } from "../prismaClient.js";

export interface ActivityEntity {
  id: string;
  code: string;
  name: string;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type PrismaActivityRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaActivityRow): ActivityEntity {
  return {
    id: String(row.id),
    code: row.code,
    name: row.name,
    category: row.category,
    duration: row.duration,
    capacity: row.capacity,
    price: row.price,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ActivityRepository {
  async findAll(): Promise<ActivityEntity[]> {
    const rows = await prisma.activity.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((row) => toEntity(row as PrismaActivityRow));
  }

  async findById(id: string): Promise<ActivityEntity | null> {
    const activityId = Number(id);
    if (!Number.isInteger(activityId)) return null;
    const row = await prisma.activity.findUnique({ where: { id: activityId } });
    return row ? toEntity(row as PrismaActivityRow) : null;
  }

  async findByCode(code: string): Promise<ActivityEntity | null> {
    const row = await prisma.activity.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
    return row ? toEntity(row as PrismaActivityRow) : null;
  }

  async create(data: CreateActivityDto): Promise<ActivityEntity> {
    const row = await prisma.activity.create({
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        duration: data.duration,
        capacity: data.capacity,
        price: data.price,
        active: data.active,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaActivityRow);
  }

  async update(id: string, data: UpdateActivityDto): Promise<ActivityEntity | null> {
    const activityId = Number(id);
    if (!Number.isInteger(activityId)) return null;
    const existing = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.activity.update({
      where: { id: activityId },
      data: {
        code: data.code ?? undefined,
        name: data.name ?? undefined,
        category: data.category ?? undefined,
        duration: data.duration ?? undefined,
        capacity: data.capacity ?? undefined,
        price: data.price ?? undefined,
        active: data.active ?? undefined,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaActivityRow);
  }

  async delete(id: string): Promise<boolean> {
    const activityId = Number(id);
    if (!Number.isInteger(activityId)) return false;
    try {
      await prisma.activity.delete({ where: { id: activityId } });
      return true;
    } catch {
      return false;
    }
  }
}

