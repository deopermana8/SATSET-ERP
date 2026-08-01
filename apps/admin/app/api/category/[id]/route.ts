import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    await requirePermission("category.update");
await requirePermission("category.view");
await requirePermission("category.update");

    const { id } = await params;
    const body = await request.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal memperbarui kategori" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    
    await requirePermission("category.delete");
await requirePermission("category.view");
await requirePermission("category.delete");

    const { id } = await params;
    await prisma.category.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menghapus kategori" }, { status: 404 });
  }
}

