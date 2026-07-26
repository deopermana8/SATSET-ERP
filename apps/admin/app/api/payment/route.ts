import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    const items = await prisma.payment.findMany({ where: { deletedAt: null }, include: { reservation: true }, orderBy: { id: "desc" } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = (await request.json().catch(() => null)) as { reservationId?: unknown; amount?: unknown; method?: unknown; status?: unknown; paidAt?: unknown } | null;
    const reservationId = Number(body?.reservationId ?? NaN);
    const amount = Number(body?.amount ?? NaN);

    if (!Number.isFinite(reservationId)) return NextResponse.json({ message: "ReservationId tidak valid" }, { status: 400 });
    if (!Number.isFinite(amount)) return NextResponse.json({ message: "Amount tidak valid" }, { status: 400 });

    try {
      const payment = await prisma.payment.create({ data: { reservationId, amount: Math.floor(amount), method: body?.method ? String(body.method) : undefined, status: body?.status ? String(body.status) : undefined, paidAt: body?.paidAt ? new Date(String(body.paidAt)) : null } });
      return NextResponse.json(payment, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "Payment untuk reservation ini sudah ada" }, { status: 409 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return NextResponse.json({ message: "Reservation tidak ditemukan" }, { status: 400 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}


