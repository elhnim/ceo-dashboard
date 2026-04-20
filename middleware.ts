import { NextResponse } from "next/server"

import { auth } from "@/lib/auth-config"

const publicPaths = new Set(["/login"])

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAuthApiRoute = pathname.startsWith("/api/auth")

  if (isAuthApiRoute || publicPaths.has(pathname)) {
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
