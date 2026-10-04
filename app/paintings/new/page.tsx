import { AdminShell } from "@/components/AdminShell";
import { PaintingForm } from "@/components/PaintingForm";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Add painting" };

export default async function NewPaintingPage() {
  const { profile } = await requireAdmin();

  return (
    <AdminShell email={profile?.email}>
      <h1 className="text-2xl font-semibold tracking-tight">Add painting</h1>
      <p className="mt-2 text-sm text-slate-500">
        Unframed and framed prices are stored separately. Preview images appear
        on the painting page as in-situ photos.
      </p>
      <div className="mt-8">
        <PaintingForm />
      </div>
    </AdminShell>
  );
}
