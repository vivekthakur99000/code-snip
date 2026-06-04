import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

const hasSessionCookie = (req: NextRequest) =>
  SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)?.value));

export default function middleware(req: NextRequest) {
  if (!hasSessionCookie(req)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/snippets/:path*"],
};
