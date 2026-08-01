import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    const items = await prisma.gate.findMany({
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
    await requirePermission("gate.create");

    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      code?: unknown;
      destinationId?: unknown;
      active?: unknown;
    } | null;

    const name = String(body?.name ?? "").trim();
    const code = String(body?.code ?? "").trim();
    const destinationId = Number(body?.destinationId ?? 0) || 0;

    if (!name) return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    if (!code) return NextResponse.json({ message: "Kode wajib diisi" }, { status: 400 });
    if (!Number.isFinite(destinationId) || destinationId <= 0) return NextResponse.json({ message: "DestinationId tidak valid" }, { status: 400 });

    try {
      const gate = await prisma.gate.create({
        data: { name, code, destinationId, active: body?.active === undefined ? true : Boolean(body?.active) },
      });

      return NextResponse.json(gate, { status: 201 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ message: "Kode gate sudah digunakan" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal membuat data" }, { status: 500 });
  }
}

