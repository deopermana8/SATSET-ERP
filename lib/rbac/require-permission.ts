import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PermissionCode } from "./permissions";

export type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

export async function requirePermission(code: PermissionCode): Promise<TokenPayload> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("accessToken")?.value;
  if (!raw) throw new Error("Unauthorized: Silakan login terlebih dahulu");

  const payload = (await verifyToken(raw)) as TokenPayload;
  if (!Number.isInteger(payload.id)) throw new Error("Unauthorized: token user tidak valid");

  if (payload.role === "SUPER_ADMIN") return payload;

  const userOverride = await prisma.userPermission.findFirst({
    where: { userId: payload.id, permission: { code } },
  });

  if (userOverride) {
    if (!userOverride.granted) throw new Error(`Forbidden: izin '${code}' dicabut untuk akun ini`);
    return payload;
  }

  const roleGrant = await prisma.rolePermission.findFirst({
    where: {
      permission: { code },
      role: { users: { some: { id: payload.id } } },
    },
  });

  if (!roleGrant) throw new Error(`Forbidden: tidak punya izin '${code}'`);
  return payload;
}

export async function getMyPermissions(): Promise<PermissionCode[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("accessToken")?.value;
    if (!raw) return [];

    const payload = (await verifyToken(raw)) as TokenPayload;
    if (!Number.isInteger(payload.id)) return [];

    if (payload.role === "SUPER_ADMIN") {
      const all = await prisma.permission.findMany({ select: { code: true } });
      return all.map((p) => p.code as PermissionCode);
    }

    const rolePerms = await prisma.rolePermission.findMany({
      where: { role: { users: { some: { id: payload.id } } } },
      include: { permission: { select: { code: true } } },
    });

    const permissions = new Set(rolePerms.map((rp) => rp.permission.code));

    const overrides = await prisma.userPermission.findMany({
      where: { userId: payload.id },
      include: { permission: { select: { code: true } } },
    });

    for (const override of overrides) {
      if (override.granted) permissions.add(override.permission.code);
      else permissions.delete(override.permission.code);
    }

    return [...permissions] as PermissionCode[];
  } catch {
    return [];
  }
}
