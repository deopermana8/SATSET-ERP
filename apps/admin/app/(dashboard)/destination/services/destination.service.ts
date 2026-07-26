import { prisma } from "@/lib/prisma";

export async function getAll(){
  return prisma.destination.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
}

export async function getById(id: number) {
  return prisma.destination.findFirst({ where: { id, deletedAt: null } });
}

