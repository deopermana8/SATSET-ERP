import { prisma } from "@/lib/prisma";

export async function getAll() {
  return prisma.visitor.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
}

export async function getById(id: number) {
  return prisma.visitor.findFirst({ where: { id, deletedAt: null } });
}


