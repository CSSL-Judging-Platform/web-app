import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check for demo user in session storage (client-side only)
  // For server-side, we'll rely on the component-level auth checks

  // Allow login page always
  if (req.nextUrl.pathname === "/login") {
    return res
  }

  // For protected routes, let the components handle auth checks
  // This prevents server-side session storage issues
  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/judge/:path*", "/contestant/:path*", "/login"],
}
