import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = { matcher: "/:path*" };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // deja pasar /login y assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) return NextResponse.next();

  // protege todo lo demás
  const token = req.cookies.get("rb.token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
