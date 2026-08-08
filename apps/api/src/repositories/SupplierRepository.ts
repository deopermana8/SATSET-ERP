import type { CreateSupplierDto, UpdateSupplierDto } from "../dto/SupplierDto.js";
import { prisma } from "../prismaClient.js";

export interface SupplierEntity {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type SupplierRecord = {
  id: number;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: SupplierRecord): SupplierEntity {
  return {
    id: String(row.id),
    code: row.contact ?? `SUP-${String(row.id).padStart(4, "0")}`,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class SupplierRepository {
  async findAll(): Promise<SupplierEntity[]> {
    const rows = await prisma.supplier.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, name: true, contact: true, phone: true, email: true, address: true, active: true, createdAt: true, updatedAt: true },
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    const supplierId = Number(id);
    if (!Number.isInteger(supplierId)) {
      return null;
    }

    const row = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true, name: true, contact: true, phone: true, email: true, address: true, active: true, createdAt: true, updatedAt: true },
    });
    return row ? toEntity(row) : null;
  }

  async findByCode(code: string): Promise<SupplierEntity | null> {
    const row = await prisma.supplier.findFirst({
      where: { contact: code },
      select: { id: true, name: true, contact: true, phone: true, email: true, address: true, active: true, createdAt: true, updatedAt: true },
    });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateSupplierDto): Promise<SupplierEntity> {
    const now = new Date();
    const row = await prisma.supplier.create({
      data: {
        name: data.name,
        contact: data.code,
        phone: data.phone,
        email: data.email,
        address: data.address,
        active: data.active,
        updatedAt: now,
      },
      select: { id: true, name: true, contact: true, phone: true, email: true, address: true, active: true, createdAt: true, updatedAt: true },
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateSupplierDto): Promise<SupplierEntity | null> {
    const supplierId = Number(id);
    if (!Number.isInteger(supplierId)) {
      return null;
    }

    const existing = await prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } });
    if (!existing) {
      return null;
    }

    const row = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: data.name,
        contact: data.code,
        phone: data.phone,
        email: data.email,
        address: data.address,
        active: data.active,
      },
      select: { id: true, name: true, contact: true, phone: true, email: true, address: true, active: true, createdAt: true, updatedAt: true },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<boolean> {
    const supplierId = Number(id);
    if (!Number.isInteger(supplierId)) {
      return false;
    }

    const existing = await prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true } });
    if (!existing) {
      return false;
    }

    await prisma.supplier.delete({ where: { id: supplierId } });
    return true;
  }
}
