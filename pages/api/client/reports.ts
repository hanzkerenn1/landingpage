import type { NextApiRequest, NextApiResponse } from "next";
import { requireClientApi } from "@/lib/auth/rbac";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireClientApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  if (req.method === "GET") {
    const rows = await db
      .select()
      .from(reports)
      .where(eq(reports.clientId, auth.clientId))
      .orderBy(desc(reports.date), desc(reports.createdAt));
    return res.status(200).json({ reports: rows });
  }

  return res.status(405).end();
}

