import AdminLayout from "@/components/admin/AdminLayout";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { withAdminGSSP } from "@/lib/auth/guard";

type Client = {
  id: string;
  name: string;
  email: string | null;
  cid: string | null;
};

type Props = { clients: Client[] };

export default function Clients({ clients }: Props) {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold shadow hover:bg-blue-700"
        >
          Add New Client
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <Th>Client</Th>
              <Th>Email</Th>
              <Th>CID</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <Td>{c.name}</Td>
                <Td>{c.email || "-"}</Td>
                <Td>{c.cid || "-"}</Td>
                <Td>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit Client
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
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

export const getServerSideProps: GetServerSideProps<Props> = withAdminGSSP(async () => {
  if (!process.env.DATABASE_URL) return { props: { clients: [] } };
  const rows = await db
    .select({ id: schema.clients.id, name: schema.clients.name, email: schema.clients.email, cid: schema.clients.cid })
    .from(schema.clients)
    .orderBy(desc(schema.clients.createdAt));
  return { props: { clients: rows } };
});
