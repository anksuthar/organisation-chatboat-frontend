import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/env";
import { decodeJwtPayload, isJwtExpired } from "@/lib/jwt";
import { loginPathForPathname, roleHomePath } from "@/lib/roles";

const PUBLIC_PATHS = ["/login", "/admin/login", "/unauthorized"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(loginPathForPathname(pathname), request.url));
  }

  const payload = decodeJwtPayload(token);
  if (!payload || isJwtExpired(payload)) {
    const response = NextResponse.redirect(new URL(loginPathForPathname(pathname), request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(roleHomePath(payload.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes (the proxy enforces its own auth via FastAPI)
  // and Next.js internals/static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
