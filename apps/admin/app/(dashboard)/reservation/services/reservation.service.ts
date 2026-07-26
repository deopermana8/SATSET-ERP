import { prisma } from "@/lib/prisma";

export async function getAll() {
  return prisma.reservation.findMany({ where: { deletedAt: null }, include: { visitor: true, destination: { select: { id: true, name: true } }, ticket: { select: { id: true, name: true, price: true } }, payment: true }, orderBy: { id: "desc" } });
}

export async function getById(id: number) {
  return prisma.reservation.findFirst({ where: { id, deletedAt: null }, include: { visitor: true, destination: true, ticket: true, payment: true } });
}


