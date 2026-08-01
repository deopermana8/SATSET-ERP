import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/require-permission";
import { prisma } from "@/lib/prisma";

/** GET /api/permission — list all registered permissions (requires permission.view). */
export async function GET() {
  try {
    await requirePermission("permission.view");

    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { code: "asc" }],
    });

    return NextResponse.json(permissions);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.startsWith("Unauthorized") ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
