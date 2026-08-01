import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PermissionCode } from "./permissions";

export type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

/**
 * Resolves the JWT from the request cookie, verifies it, and checks whether
 * the caller has the requested permission. Throws with HTTP-friendly messages
 * on failure — catch in route handlers and map to 401 / 403 responses.
 *
 * Resolution order:
 *   1. SUPER_ADMIN role → unconditionally allowed
 *   2. UserPermission row (explicit per-user override) → grant or deny
 *   3. RolePermission (via the user's role) → grant or deny
 */
export async function requirePermission(code: PermissionCode): Promise<TokenPayload> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token")?.value;

  if (!raw) {
    throw new Error("Unauthorized: Silakan login terlebih dahulu");
  }

  const payload = (await verifyToken(raw)) as TokenPayload;

  if (payload.role === "SUPER_ADMIN") {
    return payload;
  }

  const userId = payload.id;

  // 1. Check user-level explicit override (DENY beats GRANT at role level)
  const userOverride = await prisma.userPermission.findFirst({
    where: { userId, permission: { code } },
  });

  if (userOverride !== null) {
    if (!userOverride.granted) {
      throw new Error(`Forbidden: izin '${code}' dicabut untuk akun ini`);
    }
    return payload;
  }

  // 2. Check via role
  const roleGrant = await prisma.rolePermission.findFirst({
    where: {
      permission: { code },
      role: { users: { some: { id: userId } } },
    },
  });

  if (!roleGrant) {
    throw new Error(`Forbidden: tidak punya izin '${code}'`);
  }

  return payload;
}

/**
 * Returns all permission codes the current user has (for use in React
 * components / client-side menu filtering via the /api/me/permissions endpoint).
 * Returns empty array when not authenticated.
 */
export async function getMyPermissions(): Promise<PermissionCode[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("token")?.value;
    if (!raw) return [];

    const payload = (await verifyToken(raw)) as TokenPayload;

    if (payload.role === "SUPER_ADMIN") {
      const all = await prisma.permission.findMany({ select: { code: true } });
      return all.map((p) => p.code as PermissionCode);
    }

    const userId = payload.id;

    // Base: permissions from role
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role: { users: { some: { id: userId } } } },
      include: { permission: { select: { code: true } } },
    });
    const baseSet = new Set(rolePerms.map((rp) => rp.permission.code));

    // Apply user-level overrides
    const userOverrides = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: { select: { code: true } } },
    });

    for (const uo of userOverrides) {
      if (uo.granted) {
        baseSet.add(uo.permission.code);
      } else {
        baseSet.delete(uo.permission.code);
      }
    }

    return [...baseSet] as PermissionCode[];
  } catch {
    return [];
  }
}
