import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/permission/user?userId=1
 * Returns all explicit user-level permission overrides.
 */
export async function GET(request: Request) {
  try {
    await requirePermission("permission.view");

    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));
    if (!userId) return NextResponse.json({ message: "userId wajib diisi" }, { status: 400 });

    const rows = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
      orderBy: { permission: { code: "asc" } },
    });

    return NextResponse.json(rows);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * POST /api/permission/user
 * Body: { userId: number; permissionId: number; granted: boolean }
 * Creates or updates an explicit user-level permission override.
 */
export async function POST(request: Request) {
  try {
    await requirePermission("permission.manage");

    const body = (await request.json()) as {
      userId?: unknown;
      permissionId?: unknown;
      granted?: unknown;
    };

    const userId = Number(body?.userId);
    const permissionId = Number(body?.permissionId);
    const granted = body?.granted !== false; // default: grant

    if (!userId || !permissionId) {
      return NextResponse.json({ message: "userId dan permissionId wajib diisi" }, { status: 400 });
    }

    const row = await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { granted },
      create: { userId, permissionId, granted },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * DELETE /api/permission/user
 * Body: { userId: number; permissionId: number }
 * Removes an explicit user-level override (falls back to role permissions).
 */
export async function DELETE(request: Request) {
  try {
    await requirePermission("permission.manage");

    const body = (await request.json()) as { userId?: unknown; permissionId?: unknown };
    const userId = Number(body?.userId);
    const permissionId = Number(body?.permissionId);

    if (!userId || !permissionId) {
      return NextResponse.json({ message: "userId dan permissionId wajib diisi" }, { status: 400 });
    }

    await prisma.userPermission.deleteMany({ where: { userId, permissionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
