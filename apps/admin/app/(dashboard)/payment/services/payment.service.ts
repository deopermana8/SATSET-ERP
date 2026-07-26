import { prisma } from "@/lib/prisma";

export async function getAll() {
  return prisma.payment.findMany({ where: { deletedAt: null }, include: { reservation: true }, orderBy: { id: "desc" } });
}

export async function getById(id: number) {
  return prisma.payment.findFirst({ where: { id, deletedAt: null }, include: { reservation: true } });
}


