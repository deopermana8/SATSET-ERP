import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "../prismaClient.js";
import type { IncomingMessage } from "node:http";

const SECRET = process.env.JWT_ACCESS_SECRET;
if (!SECRET || SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be set and at least 32 characters long");
}

export interface AdminTokenPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function b64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function b64urlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

export function signAdminJwt(payload: Omit<AdminTokenPayload, "iat" | "exp">, ttlSeconds = 7 * 24 * 3600): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const sig = createHmac("sha256", SECRET!).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyAdminJwt(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = createHmac("sha256", SECRET!).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(b64urlDecode(body)) as AdminTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Extract Bearer token from Authorization header
function extractBearerToken(request: IncomingMessage): string | null {
  const auth = request.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

// Verify JWT and check role/permission from DB
export async function verifySettingsAuth(
  request: IncomingMessage,
  requiredPermission = "settings.admin"
): Promise<{ ok: true; payload: AdminTokenPayload } | { ok: false; status: 401 | 403; error: string }> {
  return verifyJwtPermission(request, requiredPermission);
}

// Same check, used for report endpoints
export async function verifyReportAuth(
  request: IncomingMessage
): Promise<{ ok: true; payload: AdminTokenPayload } | { ok: false; status: 401 | 403; error: string }> {
  return verifyJwtPermission(request, "wisata.laporan");
}

async function verifyJwtPermission(
  request: IncomingMessage,
  requiredPermission: string
): Promise<{ ok: true; payload: AdminTokenPayload } | { ok: false; status: 401 | 403; error: string }> {
  const token = extractBearerToken(request);
  if (!token) return { ok: false, status: 401, error: "Unauthorized: token tidak ditemukan" };

  const payload = verifyAdminJwt(token);
  if (!payload) return { ok: false, status: 401, error: "Unauthorized: token tidak valid atau kadaluarsa" };

  // SUPER_ADMIN always allowed
  if (payload.role === "SUPER_ADMIN") return { ok: true, payload };

  // Otherwise check specific permission
  const perm = await prisma.permission.findUnique({
    where: { code: requiredPermission },
    select: { id: true },
  });
  if (!perm) return { ok: false, status: 403, error: `Forbidden: permission '${requiredPermission}' tidak ditemukan` };

  // Check user override (deny or grant)
  const override = await prisma.userPermission.findFirst({
    where: { userId: payload.id, permissionId: perm.id },
  });
  if (override) {
    if (!override.granted) return { ok: false, status: 403, error: `Forbidden: izin '${requiredPermission}' dicabut` };
    return { ok: true, payload };
  }

  // Check role grant
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { roleId: true },
  });
  if (!user) return { ok: false, status: 403, error: "Forbidden: user tidak ditemukan" };

  const roleGrant = await prisma.rolePermission.findFirst({
    where: { roleId: user.roleId, permissionId: perm.id },
  });
  if (!roleGrant) return { ok: false, status: 403, error: `Forbidden: tidak punya izin '${requiredPermission}'` };

  return { ok: true, payload };
}
