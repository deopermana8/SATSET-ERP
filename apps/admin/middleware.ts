import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {

    const token =
        request.cookies.get("next-auth.session-token") ??
        request.cookies.get("__Secure-next-auth.session-token")

    const pathname = request.nextUrl.pathname

    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next()
    }

    if (!token) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)"
    ]
}
