"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PaintingWithImages } from "@painting-store/shared";
import { createClient } from "@/lib/supabase/client";

export function DeletePaintingButton({
  painting,
  className = "text-sm text-red-700 disabled:opacity-50",
}: {
  painting: PaintingWithImages;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Delete “${painting.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const supabase = createClient();
    const paths = painting.painting_images
      .map((image) => image.storage_path)
      .filter((path): path is string => Boolean(path));
    if (paths.length) {
      await supabase.storage.from("paintings").remove(paths);
    }
    const { error } = await supabase.from("paintings").delete().eq("id", painting.id);
    setBusy(false);
    if (error) {
      window.alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" disabled={busy} onClick={remove} className={className}>
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
