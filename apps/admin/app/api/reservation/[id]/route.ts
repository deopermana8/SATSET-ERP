import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

function parseId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const item = await prisma.reservation.findFirst({ where: { id: parsedId, deletedAt: null }, include: { visitor: true, destination: true, ticket: true, payment: true } });
    if (!item) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const body = (await request.json().catch(() => null)) as { code?: unknown; visitorId?: unknown; destinationId?: unknown; ticketId?: unknown; quantity?: unknown; totalPrice?: unknown; status?: unknown; visitDate?: unknown } | null;

    try {
      const updated = await prisma.reservation.update({ where: { id: parsedId }, data: { code: body?.code !== undefined ? String(body.code) : undefined, visitorId: body?.visitorId !== undefined ? Number(body.visitorId) : undefined, destinationId: body?.destinationId !== undefined ? Number(body.destinationId) : undefined, ticketId: body?.ticketId !== undefined ? Number(body.ticketId) : undefined, quantity: body?.quantity !== undefined ? Number(body.quantity) : undefined, totalPrice: body?.totalPrice !== undefined ? Number(body.totalPrice) : undefined, status: body?.status !== undefined ? String(body.status) : undefined, visitDate: body?.visitDate !== undefined ? (body.visitDate ? new Date(String(body.visitDate)) : null) : undefined } });
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "Kode reservation sudah ada" }, { status: 409 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Reservation tidak ditemukan" }, { status: 404 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return NextResponse.json({ message: "Foreign key constraint gagal: cek visitor/destination/ticket" }, { status: 400 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    try {
      await prisma.reservation.update({ where: { id: parsedId }, data: { deletedAt: new Date() } });
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Reservation tidak ditemukan" }, { status: 404 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus data" }, { status: 500 });
  }
}

