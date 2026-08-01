import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    
    await requirePermission("destination.view");
const destinations = await prisma.destination.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    
    
    await requirePermission("destination.create");
const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: body?.description ? String(body.description).trim() : null,
        address: body?.address ? String(body.address).trim() : null,
        phone: body?.phone ? String(body.phone).trim() : null,
        email: body?.email ? String(body.email).trim() : null,
        active: true,
      },
    });

    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Gagal membuat destinasi" },
      { status: 500 }
    );
  }
}


