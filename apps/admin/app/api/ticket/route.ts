import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    await requirePermission("ticket.view");
const items = await prisma.ticket.findMany({
      where: { deletedAt: null },
      include: { destination: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    
    await requirePermission("ticket.create");
await requirePermission("ticket.view");
await requirePermission("ticket.create");

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      type?: unknown;
      price?: unknown;
      destinationId?: unknown;
      active?: unknown;
    } | null;

    const name = String(body?.name ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const price = Number(body?.price ?? NaN);

    if (!name) return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    if (!type) return NextResponse.json({ message: "Tipe wajib diisi" }, { status: 400 });
    if (!Number.isFinite(price)) return NextResponse.json({ message: "Harga tidak valid" }, { status: 400 });

    try {
      const ticket = await prisma.ticket.create({
        data: {
          name,
          type,
          price: Math.floor(price),
          destinationId: body?.destinationId ? Number(body.destinationId) : null,
          active: body?.active === undefined ? true : Boolean(body.active),
        },
      });

      return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Ticket already exists" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}





