import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

function NavLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const active = router.pathname === href || router.pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-screen">
        <aside className="border-r bg-white p-4 space-y-4">
          <div className="text-lg font-extrabold tracking-tight">KIU MEDIA</div>
          <nav className="space-y-1">
            <NavLink href="/admin/dashboard" label="Dashboard" />
            <NavLink href="/admin/clients" label="Clients" />
            <NavLink href="/admin/settings" label="Settings" />
          </nav>
        </aside>
        <main className="p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

