import { NextResponse } from "next/server";

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

    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const destination = await prisma.destination.findUnique({
      where: { id: parsedId },
    });

    if (!destination || destination.deletedAt) {
      return NextResponse.json({ message: "Destinasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(destination);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Gagal memuat destinasi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("destination.update");

    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    }

    const destination = await prisma.destination.update({
      where: { id: parsedId },
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: body?.description ? String(body.description).trim() : null,
        address: body?.address ? String(body.address).trim() : null,
        phone: body?.phone ? String(body.phone).trim() : null,
        email: body?.email ? String(body.email).trim() : null,
      },
    });

    return NextResponse.json(destination);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Gagal memperbarui destinasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await requirePermission("destination.delete");

    const { id } = await params;
    const parsedId = parseId(id);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.destination.update({
      where: { id: parsedId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Gagal menghapus destinasi" },
      { status: 500 }
    );
  }
}
