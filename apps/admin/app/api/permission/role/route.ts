import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/permission/role?roleId=1
 * Returns all permission codes assigned to a role.
 */
export async function GET(request: Request) {
  try {
    await requirePermission("permission.view");

    const { searchParams } = new URL(request.url);
    const roleId = Number(searchParams.get("roleId"));
    if (!roleId) return NextResponse.json({ message: "roleId wajib diisi" }, { status: 400 });

    const rows = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
      orderBy: { permission: { code: "asc" } },
    });

    return NextResponse.json(rows.map((r) => r.permission));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * POST /api/permission/role
 * Body: { roleId: number; permissionId: number }
 * Assigns a permission to a role.
 */
export async function POST(request: Request) {
  try {
    await requirePermission("permission.manage");

    const body = (await request.json()) as { roleId?: unknown; permissionId?: unknown };
    const roleId = Number(body?.roleId);
    const permissionId = Number(body?.permissionId);

    if (!roleId || !permissionId) {
      return NextResponse.json({ message: "roleId dan permissionId wajib diisi" }, { status: 400 });
    }

    const row = await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

/**
 * DELETE /api/permission/role
 * Body: { roleId: number; permissionId: number }
 * Removes a permission from a role.
 */
export async function DELETE(request: Request) {
  try {
    await requirePermission("permission.manage");

    const body = (await request.json()) as { roleId?: unknown; permissionId?: unknown };
    const roleId = Number(body?.roleId);
    const permissionId = Number(body?.permissionId);

    if (!roleId || !permissionId) {
      return NextResponse.json({ message: "roleId dan permissionId wajib diisi" }, { status: 400 });
    }

    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
