import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth/rbac";
import { db } from "@/db";
import { reports } from "@/db/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdminApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });
  const { id } = req.query as { id: string };

  if (req.method === "POST") {
    const { date, topup, spend, click, impression, status, notes } = req.body || {};
    if (!date) return res.status(400).json({ message: "date is required" });
    const inserted = await db
      .insert(reports)
      .values({ id: crypto.randomUUID(), clientId: id, date, topup, spend, click, impression, status, notes })
      .returning();
    return res.status(201).json({ report: inserted[0] });
  }

  return res.status(405).end();
}
