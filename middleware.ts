import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isLogin = req.nextUrl.pathname === "/admin/login";

  // Allow non-admin routes and the login page without touching Supabase
  if (!isAdminPath || isLogin) return NextResponse.next();

  if (!process.env.DATABASE_URL) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // Edge-safe check: only verify the presence of session cookie here.
  // Full authorization is enforced in server-side page guards.
  const sessionId = req.cookies.get("session")?.value ?? null;
  if (!sessionId) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

// No cookie serialization in middleware to avoid Node-only APIs.
