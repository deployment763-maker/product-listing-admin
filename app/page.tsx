import { coverImage, formatPrice, type PaintingWithImages } from "@painting-store/shared";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const paintings = (data ?? []) as PaintingWithImages[];
  const available = paintings.filter((item) => item.status === "AVAILABLE").length;
  const sold = paintings.filter((item) => item.status === "SOLD").length;
  const recent = paintings.slice(0, 5);

  return (
    <AdminShell email={profile?.email}>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total paintings" value={paintings.length} />
        <Stat label="Available" value={available} />
        <Stat label="Sold" value={sold} />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-medium">Recently added</h2>
        <Link href="/paintings/new" className="text-sm text-slate-600 hover:text-slate-900">
          Add painting
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {recent.length === 0 ? (
          <li className="p-6 text-sm text-slate-500">No paintings yet.</li>
        ) : (
          recent.map((painting) => {
            const cover = coverImage(painting.painting_images);
            return (
              <li key={painting.id} className="flex items-center gap-4 px-4 py-3">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover.image_url} alt="" className="h-12 w-10 object-cover" />
                ) : (
                  <div className="h-12 w-10 bg-slate-100" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{painting.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatPrice(painting.price, painting.currency)} · {painting.status}
                  </p>
                </div>
                <Link
                  href={`/paintings/${painting.id}/edit`}
                  className="text-sm text-slate-600 hover:underline"
                >
                  Edit
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
