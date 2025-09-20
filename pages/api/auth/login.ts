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
// Track failures per ip+username
const bucket = new Map<string, RateEntry>();

const keyOf = (ip: string, username: string) => `${ip}|${username}`;
function isRateLimited(ip: string, username: string) {
  const key = keyOf(ip, username);
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry) return false;
  if (now > entry.resetAt) {
    bucket.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}
function markFailure(ip: string, username: string) {
  const key = keyOf(ip, username);
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}
function clearFailures(ip: string, username: string) {
  bucket.delete(keyOf(ip, username));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const { username, password } = req.body || {};
  if (isRateLimited(ip, String(username ?? ""))) {
    return res.status(429).json({ message: "Too many attempts. Try again later." });
  }
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Avoid parameterized LIMIT for pg-mem compatibility in local dev
  const rows = await db.select().from(usersTable).where(eq(usersTable.username, username));
  const user = rows[0];
  if (!user) {
    markFailure(ip, username);
    return res.status(401).json({ message: "Invalid credentials" });
  }
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
  if (!valid) {
    markFailure(ip, username);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  clearFailures(ip, username);

  const session = await lucia.createSession(user.id, {});
  const cookie = lucia.createSessionCookie(session.id);
  res.setHeader("Set-Cookie", serializeCookie(cookie.name, cookie.value, cookie.attributes));
  return res.status(200).json({ ok: true });
}
