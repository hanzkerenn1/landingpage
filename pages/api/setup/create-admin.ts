import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Argon2id } from "oslo/password";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.DATABASE_URL) return res.status(500).json({ message: "DATABASE_URL not set" });

  try {
    const { username, password, email } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    // Allow only if no user exists yet (one-time init)
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    if (existing.length > 0) return res.status(403).json({ message: "Already initialized" });

    const hashedPassword = await new Argon2id().hash(password);
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, username, email, hashedPassword, role: "admin" });
    return res.status(201).json({ ok: true, user: { id, username, email: email ?? null, role: "admin" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return res.status(500).json({ message });
  }
}
