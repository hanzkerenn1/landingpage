import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth/rbac";
import { db } from "@/db";
import { users, clients } from "@/db/schema";
import { Argon2id } from "oslo/password";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdminApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  if (req.method === "POST") {
    const { username, password, role = "client", email, clientId } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username and password required" });
    if (role === "client") {
      if (!clientId) return res.status(400).json({ message: "clientId is required for client role" });
      const exists = await db.select({ id: clients.id }).from(clients).where(eq(clients.id, clientId));
      if (!exists[0]) return res.status(400).json({ message: "client not found" });
    }
    // Avoid parameterized LIMIT for pg-mem compatibility in local dev
    const existing = await db.select().from(users).where(eq(users.username, username));
    if (existing[0]) return res.status(409).json({ message: "username already exists" });
    const hashedPassword = await new Argon2id().hash(password);
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, username, email, hashedPassword, role, clientId });
    return res.status(201).json({ user: { id, username, role, email: email ?? null } });
  }

  return res.status(405).end();
}
