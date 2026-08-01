import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    
    await requirePermission("visitor.view");
const items = await prisma.visitor.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("visitor.create");
const body = (await request.json().catch(() => null)) as { name?: unknown; email?: unknown; phone?: unknown; idCard?: unknown } | null;
    const name = String(body?.name ?? "").trim();
    if (!name) return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });

    try {
      const visitor = await prisma.visitor.create({ data: { name, email: body?.email ? String(body.email) : null, phone: body?.phone ? String(body.phone) : null, idCard: body?.idCard ? String(body.idCard) : null } });
      return NextResponse.json(visitor, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Email atau ID Card sudah terdaftar" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}




