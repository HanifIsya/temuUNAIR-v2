import { NextRequest, NextResponse } from "next/server";

import { parseSessionToken } from "@/server/auth/session";

/** Protected (app) routes from the FE-01 route map (layout mirrors server RBAC). */
export const APP_AUTH_MATCHER = ["/home", "/reports", "/claims", "/notifications", "/me"] as const;

export function isProtectedPath(pathname: string): boolean {
  return APP_AUTH_MATCHER.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Cheap cookie-presence gate; the (app) layout does the authoritative session check. */
export function authRedirect(request: NextRequest): NextResponse | null {
  if (!isProtectedPath(request.nextUrl.pathname)) return null;
  if (parseSessionToken(request.headers.get("cookie")) !== null) return null;

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}
