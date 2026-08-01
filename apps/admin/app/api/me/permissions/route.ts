import { NextResponse } from "next/server";
import { getMyPermissions } from "@/lib/rbac/require-permission";

/**
 * GET /api/me/permissions
 * Returns the full list of permission codes available to the authenticated user.
 * Used by the Sidebar / menu to filter visible items client-side.
 */
export async function GET() {
  const codes = await getMyPermissions();
  return NextResponse.json({ permissions: codes });
}
