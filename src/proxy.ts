import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/demo/session";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Gates the dashboard on a valid session cookie and keeps signed-in visitors
 * away from the auth pages. Demo mode has no token to refresh, so this only
 * has to verify the cookie's signature.
 */
export async function proxy(request: NextRequest) {
  const userId = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const path = request.nextUrl.pathname;

  if (PROTECTED_PREFIXES.some((p) => path.startsWith(p)) && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if ((path === "/login" || path === "/signup") && userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|api/demo-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
