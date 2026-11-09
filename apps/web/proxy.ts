import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"
import { isDemoPath } from "@/lib/demo"

export function proxy(request: NextRequest) {
  if (getSessionCookie(request) || isDemoPath(request.nextUrl.pathname))
    return NextResponse.next()
  const url = new URL("/auth/signin", request.url)
  url.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/sites/:path*", "/settings/:path*"],
}
