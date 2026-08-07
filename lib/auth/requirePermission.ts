import { cookies } from "next/headers";
import { hasPermission } from "./permission-db";
import { verifyToken } from "./auth";

export async function requirePermission(permission: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) throw new Error("Silakan login");

  const payload = (await verifyToken(token)) as { id: number };
  if (!Number.isInteger(payload.id)) throw new Error("Token user tidak valid");

  const allowed = await hasPermission(payload.id, permission);
  if (!allowed) throw new Error("Akses ditolak");
}
