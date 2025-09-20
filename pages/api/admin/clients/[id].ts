import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth/rbac";
import { db } from "@/db";
import { clients, reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdminApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const client = (await db.select().from(clients).where(eq(clients.id, id)).limit(1))[0];
    if (!client) return res.status(404).json({ message: "Not found" });
    const r = await db.select().from(reports).where(eq(reports.clientId, id)).orderBy(desc(reports.date));
    return res.status(200).json({ client, reports: r });
  }

  if (req.method === "PUT") {
    const { name, email, cid, notes } = req.body || {};
    const updated = await db
      .update(clients)
      .set({ name, email, cid, notes })
      .where(eq(clients.id, id))
      .returning();
    return res.status(200).json({ client: updated[0] });
  }

  return res.status(405).end();
}
