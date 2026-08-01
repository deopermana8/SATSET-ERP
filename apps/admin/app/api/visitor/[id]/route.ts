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
    
    await requirePermission("visitor.view");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const item = await prisma.visitor.findFirst({ where: { id: parsedId, deletedAt: null } });
    if (!item) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("visitor.update");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const body = (await request.json().catch(() => null)) as { name?: unknown; email?: unknown; phone?: unknown; idCard?: unknown } | null;

    try {
      const updated = await prisma.visitor.update({ where: { id: parsedId }, data: { name: body?.name !== undefined ? String(body.name) : undefined, email: body?.email !== undefined ? (body.email ? String(body.email) : null) : undefined, phone: body?.phone !== undefined ? (body.phone ? String(body.phone) : null) : undefined, idCard: body?.idCard !== undefined ? (body.idCard ? String(body.idCard) : null) : undefined } });
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ message: "Email atau ID Card sudah terdaftar" }, { status: 409 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Visitor tidak ditemukan" }, { status: 404 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("visitor.delete");
const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    try {
      await prisma.visitor.update({ where: { id: parsedId }, data: { deletedAt: new Date() } });
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ message: "Visitor tidak ditemukan" }, { status: 404 });
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus data" }, { status: 500 });
  }
}



