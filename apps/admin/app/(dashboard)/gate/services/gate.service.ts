import { prisma } from "@/lib/prisma";

export async function getAll(){
  return await prisma.gate.findMany({
    where: { deletedAt: null },
    include: { destination: { select: { id: true, name: true } } },
    orderBy: { id: "asc" },
  });
}

