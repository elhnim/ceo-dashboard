import { NextResponse } from "next/server"

import { auth } from "@/lib/auth-config"

const publicPaths = new Set(["/login"])

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAuthApiRoute = pathname.startsWith("/api/auth")
  // Founder Console is the single-user MVP surface; authentication is a future
  // capability, so its pages and API are not gated by Microsoft SSO yet.
  const isFounderConsole =
    pathname === "/console" ||
    pathname.startsWith("/console/") ||
    pathname.startsWith("/api/console")

  if (isAuthApiRoute || isFounderConsole || publicPaths.has(pathname)) {
    return NextResponse.next()
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
