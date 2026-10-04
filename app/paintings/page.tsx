import Link from "next/link";
import type { PaintingWithImages } from "@painting-store/shared";
import { AdminShell } from "@/components/AdminShell";
import { PaintingsTable } from "@/components/PaintingsTable";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paintings" };

export default async function PaintingsPage() {
  const { supabase, profile } = await requireAdmin();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const paintings = ((data ?? []) as PaintingWithImages[]).map((painting) => ({
    ...painting,
    painting_images: [...(painting.painting_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  }));

  return (
    <AdminShell email={profile?.email}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Paintings</h1>
        <Link
          href="/paintings/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add painting
        </Link>
      </div>
      <div className="mt-8">
        <PaintingsTable paintings={paintings} />
      </div>
    </AdminShell>
  );
}
