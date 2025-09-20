import AdminLayout from "@/components/admin/AdminLayout";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { withAdminGSSP } from "@/lib/auth/guard";

type Client = {
  id: string;
  name: string;
  email: string | null;
  cid: string | null;
  notes: string | null;
};

type Report = {
  id: string;
  date: string;
  topup: number | null;
  spend: number | null;
  click: number | null;
  impression: number | null;
  status: string | null;
  notes: string | null;
};

type Props = { client: Client; reports: Report[] };

export default function ClientDetail({ client, reports }: Props) {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Edit Client</h1>
      <div className="mt-6 grid lg:grid-cols-2 gap-8">
        <ClientForm client={client} />
        <ReportForm clientId={client.id} />
      </div>
      <div className="mt-10">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border bg-white shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <Th>Date</Th>
                <Th>Topup</Th>
                <Th>Spend</Th>
                <Th>Click</Th>
                <Th>Impression</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td>{r.date}</Td>
                  <Td>{r.topup ?? "-"}</Td>
                  <Td>{r.spend ?? "-"}</Td>
                  <Td>{r.click ?? "-"}</Td>
                  <Td>{r.impression ?? "-"}</Td>
                  <Td>{r.status ?? "-"}</Td>
                  <Td>{r.notes ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 text-sm">{children}</td>;
}

function ClientForm({ client }: { client: Client }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: client.name,
      email: client.email || "",
      cid: client.cid || "",
      notes: client.notes || "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      setMessage("Saved");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  });
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
      <Field label="Client Name">
        <input className="input" {...register("name", { required: true })} />
      </Field>
      <Field label="Email">
        <input className="input" type="email" {...register("email")} />
      </Field>
      <Field label="CID / Ad Account ID">
        <input className="input" {...register("cid")} />
      </Field>
      <Field label="Notes">
        <textarea className="input" rows={4} {...register("notes")} />
      </Field>
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save Client"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <style jsx>{`
        .input { @apply rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white; }
        .btn-primary { @apply rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 w-max; }
      `}</style>
    </form>
  );
}

function ReportForm({ clientId }: { clientId: string }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      reset({ date: new Date().toISOString().slice(0, 10) });
      setMessage("Report saved");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  });
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
      <h2 className="text-lg font-semibold">Add Daily Report</h2>
      <Field label="Date">
        <input type="date" className="input" {...register("date", { required: true })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Topup">
          <input type="number" step="0.01" className="input" {...register("topup")} />
        </Field>
        <Field label="Spend">
          <input type="number" step="0.01" className="input" {...register("spend")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Click">
          <input type="number" className="input" {...register("click")} />
        </Field>
        <Field label="Impression">
          <input type="number" className="input" {...register("impression")} />
        </Field>
      </div>
      <Field label="Ad Status">
        <input className="input" {...register("status")} />
      </Field>
      <Field label="Notes">
        <textarea className="input" rows={4} {...register("notes")} />
      </Field>
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save Report"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <style jsx>{`
        .input { @apply rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white; }
        .btn-primary { @apply rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 w-max; }
      `}</style>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = withAdminGSSP(async (ctx) => {
  if (!process.env.DATABASE_URL) return { notFound: true } as GetServerSidePropsResult<Props>;
  const id = (ctx.query.id as string) || "";
  const client = (await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1))[0];
  if (!client) return { notFound: true };
  const r = await db.select().from(schema.reports).where(eq(schema.reports.clientId, id)).orderBy(desc(schema.reports.date));
  return { props: { client, reports: r } };
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
