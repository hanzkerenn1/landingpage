import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth/rbac";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdminApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  if (req.method === "GET") {
    const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return res.status(200).json({ clients: rows });
  }

  if (req.method === "POST") {
    const { name, email, cid, notes } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });
    const row: typeof clients.$inferInsert = { id: crypto.randomUUID(), name, email, cid, notes };
    const inserted = await db.insert(clients).values(row).returning();
    return res.status(201).json({ client: inserted[0] });
  }

  return res.status(405).end();
}
