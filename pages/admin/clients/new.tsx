import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import { withAdminGSSP } from "@/lib/auth/guard";

type FormData = { name: string; email?: string; cid?: string; notes?: string };

export default function NewClient() {
  const { register, handleSubmit } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      const { client } = await res.json();
      router.replace(`/admin/clients/${client.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Add New Client</h1>
      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 max-w-xl">
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Create Client"}
        </button>
      </form>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      <style jsx>{`
        .input { @apply rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white; }
        .btn-primary { @apply rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 w-max; }
      `}</style>
    </label>
  );
}

export const getServerSideProps: GetServerSideProps = withAdminGSSP();
