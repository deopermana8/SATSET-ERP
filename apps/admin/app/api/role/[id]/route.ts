import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body = await request.json();

    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Update gagal" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;

    await prisma.role.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Delete gagal" },
      { status: 400 }
    );
  }
}
