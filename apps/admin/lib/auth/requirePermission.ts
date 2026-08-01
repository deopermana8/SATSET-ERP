import { cookies } from "next/headers";
import { hasPermission } from "./permission-db";
import { verifyToken } from "./auth";

export async function requirePermission(permission: string): Promise<void> {
  // Task 023 step 1-2: read token cookie.
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Silakan login");

  // Task 023 step 3-4: verify JWT and extract userId.
  const payload = (await verifyToken(token)) as { id: number };
  const userId = payload.id;

  // Task 024: check permission; throw on denial.
  const allowed = await hasPermission(userId, permission);
  if (!allowed) throw new Error("Akses ditolak");
}

