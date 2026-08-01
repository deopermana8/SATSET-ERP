import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";

export async function GET() {
  try {
    await requireAuth();
    await requirePermission("category.view");

    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    
    await requirePermission("category.create");
await requirePermission("category.view");
await requirePermission("category.create");

    const body = await request.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat kategori" }, { status: 500 });
  }
}


