"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  coverImage,
  formatPrice,
  type PaintingStatus,
  type PaintingWithImages,
} from "@painting-store/shared";
import { DeletePaintingButton } from "@/components/DeletePaintingButton";
import { createClient } from "@/lib/supabase/client";

export function PaintingsTable({ paintings }: { paintings: PaintingWithImages[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(id: string, status: PaintingStatus) {
    setBusyId(id);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("paintings")
      .update({ status })
      .eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  if (paintings.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No paintings yet.{" "}
        <Link href="/paintings/new" className="text-slate-900 underline">
          Add the first one
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paintings.map((painting) => {
            const cover = coverImage(painting.painting_images);
            const busy = busyId === painting.id;
            return (
              <tr key={painting.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  {cover ? (
                    <Image
                      src={cover.image_url}
                      alt=""
                      width={48}
                      height={60}
                      className="h-14 w-11 object-cover"
                    />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{painting.title}</td>
                <td className="px-4 py-3">
                  {formatPrice(painting.price, painting.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      painting.status === "SOLD" ? "text-slate-500" : "text-emerald-700"
                    }
                  >
                    {painting.status === "SOLD" ? "Sold" : "Available"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(painting.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/paintings/${painting.id}/edit`}
                      className="text-slate-900 underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                    {painting.status === "AVAILABLE" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setStatus(painting.id, "SOLD")}
                        className="text-slate-600 disabled:opacity-50"
                      >
                        Mark sold
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setStatus(painting.id, "AVAILABLE")}
                        className="text-slate-600 disabled:opacity-50"
                      >
                        Mark available
                      </button>
                    )}
                    <DeletePaintingButton painting={painting} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
