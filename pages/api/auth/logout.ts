import type { NextApiRequest, NextApiResponse } from "next";
import { lucia } from "@/lib/auth/lucia";
import { serializeCookie } from "@/lib/auth/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const sessionId = req.cookies["session"] ?? null;
  if (sessionId) await lucia.invalidateSession(sessionId);
  const blank = lucia.createBlankSessionCookie();
  res.setHeader("Set-Cookie", serializeCookie(blank.name, blank.value, blank.attributes));
  res.status(200).json({ ok: true });
}
