import { GetServerSideProps } from "next";
import { parse as parseCookie } from "cookie";
import { lucia } from "@/lib/auth/lucia";
import { serializeCookie } from "@/lib/auth/session";
import { db } from "@/db";
import { reports, clients } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { useEffect, useState } from "react";

type Report = typeof reports.$inferSelect;
type Props = {
  clientName: string;
  totals: { totalTopup: number; totalSpend: number; balance: number };
  initialReports: Report[];
};

export default function ClientDashboard({ clientName, totals, initialReports }: Props) {
  const [rows, setRows] = useState<Report[]>(initialReports);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/client/reports");
        if (!res.ok) return;
        const data = await res.json();
        setRows(data.reports || []);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Client Dashboard</h1>
            <p className="text-gray-600">{clientName}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Widget label="Total Topup" value={totals.totalTopup} />
          <Widget label="Total Spend" value={totals.totalSpend} />
          <Widget label="Sisa Saldo" value={totals.balance} />
        </section>

        <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Detail Iklan</h2>
            <p className="text-sm text-gray-600">Terupdate otomatis tiap 15 detik</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Topup</Th>
                  <Th>Spend</Th>
                  <Th>Click</Th>
                  <Th>Impressions</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <Td>{r.date?.toString()}</Td>
                    <Td>{fmt(r.topup)}</Td>
                    <Td>{fmt(r.spend)}</Td>
                    <Td>{fmt(r.click, 0)}</Td>
                    <Td>{fmt(r.impression, 0)}</Td>
                    <Td>{r.status || "-"}</Td>
                    <Td>{r.notes || "-"}</Td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={7}>Belum ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Widget({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2">{children}</td>;
}

function fmt(v: any, digits = 2) {
  const n = typeof v === "number" ? v : parseFloat(v || "0");
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { req, res } = ctx;
  const cookies = parseCookie(req.headers.cookie || "");
  const sessionId = cookies["session"] ?? null;
  if (!sessionId) {
    return {
      redirect: {
        destination: `/admin/login?redirect=${encodeURIComponent("/client/dashboard")}`,
        permanent: false,
      },
    };
  }
  const result = await lucia.validateSession(sessionId);
  if (result.session?.fresh) {
    const cookie = lucia.createSessionCookie(result.session.id);
    res.setHeader("Set-Cookie", serializeCookie(cookie.name, cookie.value, cookie.attributes));
  }
  const user = result.user as any;
  if (!result.session || !user || user.role !== "client" || !user.clientId) {
    return {
      redirect: {
        destination: `/admin/login?redirect=${encodeURIComponent("/client/dashboard")}`,
        permanent: false,
      },
    };
  }

  // Fetch client name and totals
  const clientRow = await db.select().from(clients).where(eq(clients.id, user.clientId));
  const clientName = clientRow[0]?.name || "Client";

  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.clientId, user.clientId))
    .orderBy(desc(reports.date), desc(reports.createdAt));

  const totalTopup = rows.reduce((s, r) => s + (r.topup ? Number(r.topup) : 0), 0);
  const totalSpend = rows.reduce((s, r) => s + (r.spend ? Number(r.spend) : 0), 0);
  const balance = totalTopup - totalSpend;

  return {
    props: {
      clientName,
      totals: { totalTopup, totalSpend, balance },
      initialReports: rows as any,
    },
  };
};

