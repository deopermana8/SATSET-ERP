import { prisma } from "@/lib/prisma";

export async function getAll() {
  return prisma.ticket.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
}

export async function getById(id: number) {
  return prisma.ticket.findFirst({ where: { id, deletedAt: null } });
}


