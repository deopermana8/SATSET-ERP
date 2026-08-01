import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    const items = await prisma.reservation.findMany({ where: { deletedAt: null }, include: { visitor: true, destination: { select: { id: true, name: true } }, ticket: { select: { id: true, name: true } }, payment: true }, orderBy: { id: "desc" } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    await requirePermission("reservation.create");
    const body = (await request.json().catch(() => null)) as { code?: unknown; visitorId?: unknown; destinationId?: unknown; ticketId?: unknown; quantity?: unknown; totalPrice?: unknown; status?: unknown; visitDate?: unknown } | null;

    const code = String(body?.code ?? "").trim();
    const visitorId = Number(body?.visitorId ?? NaN);
    const destinationId = Number(body?.destinationId ?? NaN);
    const ticketId = Number(body?.ticketId ?? NaN);
    const quantity = Number(body?.quantity ?? NaN);
    const totalPrice = Number(body?.totalPrice ?? NaN);

    if (!code) return NextResponse.json({ message: "Code wajib diisi" }, { status: 400 });
    if (!Number.isFinite(visitorId) || !Number.isFinite(destinationId) || !Number.isFinite(ticketId)) return NextResponse.json({ message: "IDs tidak valid" }, { status: 400 });
    if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ message: "Quantity tidak valid" }, { status: 400 });
    if (!Number.isFinite(totalPrice)) return NextResponse.json({ message: "Total price tidak valid" }, { status: 400 });

    try {
      const reservation = await prisma.reservation.create({ data: { code, visitorId, destinationId, ticketId, quantity, totalPrice, status: body?.status ? String(body.status) : undefined, visitDate: body?.visitDate ? new Date(String(body.visitDate)) : null } });
      return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "Kode reservation sudah ada" }, { status: 409 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return NextResponse.json({ message: "Foreign key constraint gagal: cek visitor/destination/ticket" }, { status: 400 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}


