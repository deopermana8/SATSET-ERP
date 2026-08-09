import type { CreateCustomerDto, UpdateCustomerDto } from "../dto/CustomerDto.js";
import { prisma } from "../prismaClient.js";

export interface CustomerEntity {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

type PrismaCustomerRow = {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaCustomerRow): CustomerEntity {
  return {
    id: String(row.id),
    code: row.code,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class CustomerRepository {
  async findAll(): Promise<CustomerEntity[]> {
    const rows = await prisma.customer.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((row) => toEntity(row as PrismaCustomerRow));
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const customerId = Number(id);
    if (!Number.isInteger(customerId)) return null;
    const row = await prisma.customer.findUnique({ where: { id: customerId } });
    return row ? toEntity(row as PrismaCustomerRow) : null;
  }

  async findByCode(code: string): Promise<CustomerEntity | null> {
    const row = await prisma.customer.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
    return row ? toEntity(row as PrismaCustomerRow) : null;
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const row = await prisma.customer.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    return row ? toEntity(row as PrismaCustomerRow) : null;
  }

  async create(data: CreateCustomerDto): Promise<CustomerEntity> {
    const row = await prisma.customer.create({
      data: {
        code: data.code,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaCustomerRow);
  }

  async update(id: string, data: UpdateCustomerDto): Promise<CustomerEntity | null> {
    const customerId = Number(id);
    if (!Number.isInteger(customerId)) return null;
    const existing = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.customer.update({
      where: { id: customerId },
      data: {
        code: data.code ?? undefined,
        fullName: data.fullName ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaCustomerRow);
  }

  async delete(id: string): Promise<boolean> {
    const customerId = Number(id);
    if (!Number.isInteger(customerId)) return false;
    try {
      await prisma.customer.delete({ where: { id: customerId } });
      return true;
    } catch {
      return false;
    }
  }
}
