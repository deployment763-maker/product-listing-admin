import { notFound } from "next/navigation";
import type { PaintingWithImages } from "@painting-store/shared";
import { AdminShell } from "@/components/AdminShell";
import { PaintingForm } from "@/components/PaintingForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit painting" };

type Props = PageProps<"/paintings/[id]/edit">;

export default async function EditPaintingPage({ params }: Props) {
  const { id } = await params;
  const { supabase, profile } = await requireAdmin();
  const { data, error } = await supabase
    .from("paintings")
    .select("*, painting_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  const painting = {
    ...(data as PaintingWithImages),
    painting_images: [...((data as PaintingWithImages).painting_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };

  return (
    <AdminShell email={profile?.email}>
      <h1 className="text-2xl font-semibold tracking-tight">Edit painting</h1>
      <div className="mt-8">
        <PaintingForm painting={painting} />
      </div>
    </AdminShell>
  );
}
