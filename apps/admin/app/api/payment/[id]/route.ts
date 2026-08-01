import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

function parseId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("payment.view");
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const item = await prisma.payment.findFirst({ where: { id: parsedId, deletedAt: null }, include: { reservation: true } });
    if (!item) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("payment.update");
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const body = (await request.json().catch(() => null)) as { reservationId?: unknown; amount?: unknown; method?: unknown; status?: unknown; paidAt?: unknown } | null;

    try {
      const updated = await prisma.payment.update({ where: { id: parsedId }, data: { reservationId: body?.reservationId !== undefined ? Number(body.reservationId) : undefined, amount: body?.amount !== undefined ? Math.floor(Number(body.amount)) : undefined, method: body?.method !== undefined ? String(body.method) : undefined, status: body?.status !== undefined ? String(body.status) : undefined, paidAt: body?.paidAt !== undefined ? (body.paidAt ? new Date(String(body.paidAt)) : null) : undefined } });
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "Payment untuk reservation ini sudah ada" }, { status: 409 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Payment tidak ditemukan" }, { status: 404 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return NextResponse.json({ message: "Reservation tidak ditemukan" }, { status: 400 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("payment.delete");
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    try {
      await prisma.payment.update({ where: { id: parsedId }, data: { deletedAt: new Date() } });
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Payment tidak ditemukan" }, { status: 404 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus data" }, { status: 500 });
  }
}




