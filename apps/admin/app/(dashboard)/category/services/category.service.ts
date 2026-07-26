import { prisma } from "@/lib/prisma";

export async function getAll() {
  return prisma.category.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
}

export async function getById(id: number) {
  return prisma.category.findFirst({ where: { id, deletedAt: null } });
}

