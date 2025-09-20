import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parse as parseCookie } from "cookie";
import { lucia } from "@/lib/auth/lucia";
import { serializeCookie } from "@/lib/auth/session";

type AnyProps = Record<string, unknown>;

export function withAdminGSSP<P extends AnyProps = AnyProps>(
  handler?: (ctx: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> {
  return async (ctx) => {
    const { req, res, resolvedUrl } = ctx;
    const cookies = parseCookie(req.headers.cookie || "");
    const sessionId = cookies["session"] ?? null;

    // In production on Vercel, require a DB url. In local dev, allow pg-mem fallback.
    const hasDbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_CONNECTION_STRING;
    if (process.env.NODE_ENV === "production" && process.env.VERCEL && !hasDbUrl) {
      return redirectLogin(resolvedUrl);
    }

    if (!sessionId) {
      return redirectLogin(resolvedUrl);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session?.fresh) {
      const cookie = lucia.createSessionCookie(session.id);
      res.setHeader("Set-Cookie", serializeCookie(cookie.name, cookie.value, cookie.attributes));
    }
    if (!session || user.role !== "admin") {
      return redirectLogin(resolvedUrl);
    }

    if (handler) return handler(ctx);
    return { props: {} as P };
  };
}

function redirectLogin(redirectTo: string): GetServerSidePropsResult<Record<string, never>> {
  return {
    redirect: {
      destination: `/admin/login?redirect=${encodeURIComponent(redirectTo || "/admin/dashboard")}`,
      permanent: false,
    },
  };
}
