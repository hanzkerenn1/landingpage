import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth/lucia";
import { serializeCookie } from "@/lib/auth/session";

type RateEntry = { count: number; resetAt: number };
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const bucket = new Map<string, RateEntry>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || now > entry.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count += 1;
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(429).json({ message: "Too many attempts. Try again later." });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Avoid parameterized LIMIT for pg-mem compatibility in local dev
  const rows = await db.select().from(usersTable).where(eq(usersTable.username, username));
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  // Support both Argon2 (existing users) and bcrypt (new admin via App Router route)
  let valid = false;
  try {
    if (user.hashedPassword.startsWith("$2")) {
      valid = await bcrypt.compare(password, user.hashedPassword);
    } else {
      valid = await new Argon2id().verify(user.hashedPassword, password);
    }
  } catch {
    valid = false;
  }
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const session = await lucia.createSession(user.id, {});
  const cookie = lucia.createSessionCookie(session.id);
  res.setHeader("Set-Cookie", serializeCookie(cookie.name, cookie.value, cookie.attributes));
  return res.status(200).json({ ok: true });
}
