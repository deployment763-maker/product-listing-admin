"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/paintings", label: "Paintings" },
];

export function AdminShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-slate-200 bg-white px-5 py-8 md:block">
        <p className="text-sm font-semibold tracking-tight">Shankari&apos;s Canvas</p>
        <p className="mt-1 text-xs text-slate-500">Studio admin</p>
        <nav className="mt-10 flex flex-col gap-2 text-sm">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 ${
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5">
          <p className="truncate text-xs text-slate-500">{email}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="md:pl-56">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="text-sm font-semibold">Studio admin</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </nav>
        </header>
        <div className="px-4 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
