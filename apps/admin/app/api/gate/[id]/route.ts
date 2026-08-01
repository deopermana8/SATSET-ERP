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
    await requirePermission("gate.view");
    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const item = await prisma.gate.findUnique({ where: { id: parsedId }, include: { destination: { select: { id: true, name: true } } } });
    if (!item || item.deletedAt) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("gate.update");

    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const body = (await request.json().catch(() => null)) as { name?: unknown; code?: unknown; destinationId?: unknown; active?: unknown } | null;

    const updateData: Record<string, unknown> = {};
    if (body?.name !== undefined) updateData.name = String(body.name).trim();
    if (body?.code !== undefined) updateData.code = String(body.code).trim();
    if (body?.destinationId !== undefined) updateData.destinationId = Number(body.destinationId) || undefined;
    if (body?.active !== undefined) updateData.active = Boolean(body.active);

    try {
      const updated = await prisma.gate.update({ where: { id: parsedId }, data: updateData });
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Kode gate sudah digunakan" }, { status: 409 });
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
    await requirePermission("gate.delete");

    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    await prisma.gate.update({ where: { id: parsedId }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus data" }, { status: 500 });
  }
}




