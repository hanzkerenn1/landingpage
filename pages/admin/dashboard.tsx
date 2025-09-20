import AdminLayout from "@/components/admin/AdminLayout";
import type { GetServerSideProps } from "next";
import { db, schema } from "@/db";
import { withAdminGSSP } from "@/lib/auth/guard";

type Props = {
  totals: { topup: number; spend: number; balance: number };
  weekly: { week: string; spend: number }[];
};

export default function Dashboard({ totals, weekly }: Props) {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Widget title="Total Topup" value={formatCurrency(totals.topup)} />
        <Widget title="Total Spend" value={formatCurrency(totals.spend)} />
        <Widget title="Saldo" value={formatCurrency(totals.balance)} />
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Weekly Spend</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-3">
          {weekly.map((w) => (
            <div key={w.week} className="p-3 rounded-lg border bg-white shadow-sm">
              <div className="text-xs text-gray-500">{w.week}</div>
              <div className="text-sm font-semibold">{formatCurrency(w.spend)}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

export const getServerSideProps: GetServerSideProps<Props> = withAdminGSSP(async () => {
  if (!process.env.DATABASE_URL) return { props: { totals: { topup: 0, spend: 0, balance: 0 }, weekly: [] } };
  const r = await db
    .select({ date: schema.reports.date, topup: schema.reports.topup, spend: schema.reports.spend })
    .from(schema.reports);
  const toNum = (v: unknown) => (v == null ? 0 : Number(v));
  const topup = sum(r.map((x) => toNum(x.topup)));
  const spend = sum(r.map((x) => toNum(x.spend)));
  const balance = topup - spend;
  const weekly = computeWeekly(r.map((x) => ({ date: String(x.date), spend: toNum(x.spend) })));
  return { props: { totals: { topup, spend, balance }, weekly } };
});

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

function weekKey(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getUTCFullYear();
  const firstJan = new Date(Date.UTC(year, 0, 1));
  const days = Math.floor((+d - +firstJan) / 86400000);
  const week = Math.floor((days + firstJan.getUTCDay()) / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function computeWeekly(reports: { date: string; spend: number | null }[]) {
  const map = new Map<string, number>();
  for (const r of reports) {
    const key = weekKey(r.date);
    map.set(key, (map.get(key) || 0) + (r.spend || 0));
  }
  // last 6 weeks
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([week, spend]) => ({ week, spend }));
}
