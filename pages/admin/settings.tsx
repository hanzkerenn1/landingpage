import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { withAdminGSSP } from "@/lib/auth/guard";

type FormData = { username: string; password: string; role: "admin" | "client"; email?: string; clientId?: string };

type Client = { id: string; name: string };

export default function Settings() {
  const { register, handleSubmit, reset } = useForm<FormData>({ defaultValues: { role: "client" } });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/clients");
        if (!res.ok) return;
        const data = await res.json();
        setClients((data.clients || []).map((c: any) => ({ id: c.id, name: c.name })));
      } catch {}
    })();
  }, []);
  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      setMsg("User created");
      reset({ role: values.role });
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 max-w-md">
        <h2 className="text-lg font-semibold">Create User</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4">
          <Field label="Username">
            <input type="text" className="input" {...register("username", { required: true })} />
          </Field>
          <Field label="Password">
            <input type="password" className="input" {...register("password", { required: true })} />
          </Field>
          <Field label="Email (optional)">
            <input type="email" className="input" {...register("email")} />
          </Field>
          <Field label="Role">
            <select className="input" {...register("role", { required: true })}>
              <option value="client">client</option>
              <option value="admin">admin</option>
            </select>
          </Field>
          <Field label="Attach to Client (for role=client)">
            <select className="input" {...register("clientId")}>
              <option value="">-- Select client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
          {msg && <p className="text-sm text-gray-600">{msg}</p>}
        </form>
      </div>
      <style jsx>{`
        .input { @apply rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white; }
        .btn-primary { @apply rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 w-max; }
      `}</style>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export const getServerSideProps: GetServerSideProps = withAdminGSSP();
