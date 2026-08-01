import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    await requirePermission("facility.view");
const items = await prisma.facility.findMany({
      where: { deletedAt: null },
      include: { destination: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    
    await requirePermission("facility.create");
await requirePermission("facility.view");
await requirePermission("facility.create");

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      description?: unknown;
      destinationId?: unknown;
      slug?: unknown;
      active?: unknown;
    } | null;

    const name = String(body?.name ?? "").trim();
    const destinationId = Number(body?.destinationId ?? 0) || 0;

    if (!name) return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    if (!Number.isFinite(destinationId) || destinationId <= 0) return NextResponse.json({ message: "DestinationId tidak valid" }, { status: 400 });

    try {
      const facility = await prisma.facility.create({
        data: {
          name,
          slug: String(body?.slug ?? name.toLowerCase().replace(/\s+/g, "-")),
          description: String(body?.description ?? null) || null,
          destinationId,
          active: body?.active === undefined ? true : Boolean(body?.active),
        },
      });

      return NextResponse.json(facility, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Facility sudah ada" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}



