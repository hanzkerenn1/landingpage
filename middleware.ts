import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isClientPath = req.nextUrl.pathname.startsWith("/client");
  const isLogin = req.nextUrl.pathname === "/admin/login";

  // Allow non-admin/client routes and the login page without checks
  if ((!isAdminPath && !isClientPath) || isLogin) return NextResponse.next();
  // In production on Vercel, require DATABASE_URL. In local dev, allow pg-mem fallback.
  const hasDbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_CONNECTION_STRING;

  if (process.env.NODE_ENV === "production" && process.env.VERCEL && !hasDbUrl) {
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
  matcher: ["/admin/:path*", "/client/:path*"],
};

// No cookie serialization in middleware to avoid Node-only APIs.
