import type { NextApiRequest, NextApiResponse } from "next";
import { lucia } from "@/lib/auth/lucia";

export async function getSessionFromApi(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = req.cookies["session"] ?? null;
  if (!sessionId) return { session: null, user: null };
  const result = await lucia.validateSession(sessionId);
  // Optionally rotate/refresh cookies
  if (result.session && result.session.fresh) {
    const cookie = lucia.createSessionCookie(result.session.id);
    res.setHeader("Set-Cookie", serializeCookie(cookie.name, cookie.value, cookie.attributes));
  }
  if (!result.session) {
    const blank = lucia.createBlankSessionCookie();
    res.setHeader("Set-Cookie", serializeCookie(blank.name, blank.value, blank.attributes));
  }
  return result;
}

type CookieAttributes = Partial<{
  domain: string;
  expires: Date;
  httpOnly: boolean;
  maxAge: number;
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}>;

export function serializeCookie(name: string, value: string, attributes: CookieAttributes) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (attributes.maxAge) parts.push(`Max-Age=${Math.floor(attributes.maxAge)}`);
  if (attributes.domain) parts.push(`Domain=${attributes.domain}`);
  if (attributes.path) parts.push(`Path=${attributes.path}`);
  if (attributes.expires) parts.push(`Expires=${attributes.expires.toUTCString()}`);
  if (attributes.httpOnly) parts.push(`HttpOnly`);
  if (attributes.secure) parts.push(`Secure`);
  if (attributes.sameSite) parts.push(`SameSite=${attributes.sameSite}`);
  return parts.join("; ");
}
