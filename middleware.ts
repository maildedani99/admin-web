// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get("rb.token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const role = (req.cookies.get("rb.role")?.value || "").toLowerCase();
  if (role !== "admin") return NextResponse.redirect(new URL("/403", req.url));

  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
