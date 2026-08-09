import type { CreateActivityScheduleDto } from "../dto/ActivityScheduleDto.js";
import { prisma } from "../prismaClient.js";

export interface ActivityScheduleEntity {
  id: string;
  activityId: string;
  date: string;
  session: string;
  capacity: number;
  booked: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateActivityScheduleInput {
  date?: string;
  session?: string;
  capacity?: number;
  booked?: number;
  available?: number;
}

type PrismaScheduleRow = {
  id: number;
  activityId: string;
  date: string;
  session: string;
  capacity: number;
  booked: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaScheduleRow): ActivityScheduleEntity {
  return {
    id: String(row.id),
    activityId: row.activityId,
    date: row.date,
    session: row.session,
    capacity: row.capacity,
    booked: row.booked,
    available: row.available,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class ActivityScheduleRepository {
  async findAll(): Promise<ActivityScheduleEntity[]> {
    const rows = await prisma.activitySchedule.findMany({ orderBy: [{ date: "asc" }, { session: "asc" }] });
    return rows.map((row) => toEntity(row as PrismaScheduleRow));
  }

  async findById(id: string): Promise<ActivityScheduleEntity | null> {
    const scheduleId = Number(id);
    if (!Number.isInteger(scheduleId)) return null;
    const row = await prisma.activitySchedule.findUnique({ where: { id: scheduleId } });
    return row ? toEntity(row as PrismaScheduleRow) : null;
  }

  async findByActivityAndSlot(activityId: string, date: string, session: string): Promise<ActivityScheduleEntity | null> {
    const row = await prisma.activitySchedule.findFirst({
      where: { activityId, date, session: { equals: session, mode: "insensitive" } },
    });
    return row ? toEntity(row as PrismaScheduleRow) : null;
  }

  async create(data: CreateActivityScheduleDto): Promise<ActivityScheduleEntity> {
    const row = await prisma.activitySchedule.create({
      data: {
        activityId: data.activityId,
        date: data.date,
        session: data.session,
        capacity: data.capacity,
        booked: 0,
        available: data.capacity,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaScheduleRow);
  }

  async update(id: string, data: UpdateActivityScheduleInput): Promise<ActivityScheduleEntity | null> {
    const scheduleId = Number(id);
    if (!Number.isInteger(scheduleId)) return null;
    const existing = await prisma.activitySchedule.findUnique({ where: { id: scheduleId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.activitySchedule.update({
      where: { id: scheduleId },
      data: {
        date: data.date ?? undefined,
        session: data.session ?? undefined,
        capacity: data.capacity ?? undefined,
        booked: data.booked ?? undefined,
        available: data.available ?? undefined,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaScheduleRow);
  }
}

