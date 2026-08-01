import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "SATSET_SECRET_2026"
)

const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico", "/403"]

// Ordered longest-match first so /dashboard/admin is checked before /dashboard.
const ROUTE_PERMISSION_MAP: Array<{ prefix: string; permission: string }> = [
  { prefix: "/dashboard/admin", permission: "dashboard.manage" },
  { prefix: "/dashboard",       permission: "dashboard.view"   },
]

type JwtPayload = {
  id: number
  role: string
  permissions?: string[]
}

/** Mirror of lib/auth/requirePermission for Edge middleware (no Prisma / next/headers). */
function checkPermission(payload: JwtPayload, permission: string): boolean {
  // SUPER_ADMIN and Admin bypass all checks.
  if (payload.role === "SUPER_ADMIN" || payload.role === "Admin") return true
  // Fall back to JWT-embedded permission list when present.
  return Array.isArray(payload.permissions) && payload.permissions.includes(permission)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Task 026-027: require a valid session on all protected routes.
  const raw = request.cookies.get("token")?.value
  if (!raw) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  let payload: JwtPayload

  try {
    const { payload: p } = await jwtVerify(raw, secret)
    payload = p as JwtPayload
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.delete("token")
    return res
  }

  // Task 028-030: enforce requirePermission("dashboard.manage") / ("dashboard.view").
  for (const { prefix, permission } of ROUTE_PERMISSION_MAP) {
    if (!pathname.startsWith(prefix)) continue
    if (!checkPermission(payload, permission)) {
      // Permission denied — redirect to /403 (Task 030).
      return NextResponse.redirect(new URL("/403", request.url))
    }
    break // first matching rule wins
  }

  // Forward identity headers for downstream server components.
  const response = NextResponse.next()
  response.headers.set("x-user-id",   String(payload.id   ?? ""))
  response.headers.set("x-user-role", String(payload.role ?? ""))
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

