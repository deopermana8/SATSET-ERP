import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

function parseId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();

    
    await requirePermission("ticket.view");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const item = await prisma.ticket.findFirst({ where: { id: parsedId, deletedAt: null } });
    if (!item) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("ticket.update");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      type?: unknown;
      price?: unknown;
      destinationId?: unknown;
      active?: unknown;
    } | null;

    const data: Record<string, unknown> = {};
    if (body?.name !== undefined) data.name = String(body.name).trim();
    if (body?.type !== undefined) data.type = String(body.type).trim();
    if (body?.price !== undefined) data.price = Number(body.price);
    if (body?.destinationId !== undefined) data.destinationId = body.destinationId ? Number(body.destinationId) : null;
    if (body?.active !== undefined) data.active = Boolean(body.active);

    try {
      const updated = await prisma.ticket.update({ where: { id: parsedId }, data });
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Unique constraint violation" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("ticket.delete");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.ticket.update({ where: { id: parsedId }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus data" }, { status: 500 });
  }
}



