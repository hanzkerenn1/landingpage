import type { NextApiRequest, NextApiResponse } from "next";
import { lucia } from "@/lib/auth/lucia";

export async function requireAdminApi(req: NextApiRequest, _res: NextApiResponse) {
  const sessionId = req.cookies["session"] ?? null;
  if (!sessionId) return { ok: false as const, status: 401, message: "Unauthorized" };
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) return { ok: false as const, status: 401, message: "Unauthorized" };
  if (user.role !== "admin") return { ok: false as const, status: 403, message: "Forbidden" };
  return { ok: true as const, user, session };
}
