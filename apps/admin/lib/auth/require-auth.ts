import { cookies } from "next/headers";

import { verifyToken } from "./auth";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Silakan login terlebih dahulu");
  }

  await verifyToken(token);
}
