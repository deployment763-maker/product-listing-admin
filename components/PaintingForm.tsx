"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MEDIUMS,
  PAPER_SIZES,
  slugFromTitleAndDate,
  type PaintingStatus,
  type PaintingWithImages,
  type PaperSize,
} from "@painting-store/shared";
import { createClient } from "@/lib/supabase/client";

type ImageDraft = {
  key: string;
  id?: string;
  file?: File;
  previewUrl: string;
  imageUrl?: string;
  storagePath?: string | null;
  isPreview: boolean;
  remove?: boolean;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  price: string;
  framedPrice: string;
  currency: string;
  medium: string;
  sizeLabel: PaperSize | "";
  width: string;
  height: string;
  isFramed: boolean;
  status: PaintingStatus;
  featured: boolean;
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    description: "",
    price: "",
    framedPrice: "",
    currency: "INR",
    medium: "Acrylic",
    sizeLabel: "A3",
    width: String(PAPER_SIZES.A3.width),
    height: String(PAPER_SIZES.A3.height),
    isFramed: false,
    status: "AVAILABLE",
    featured: false,
  };
}

function fromPainting(painting: PaintingWithImages): FormState {
  return {
    title: painting.title,
    slug: painting.slug,
    description: painting.description ?? "",
    price: String(painting.price ?? ""),
    framedPrice: painting.framed_price != null ? String(painting.framed_price) : "",
    currency: painting.currency || "INR",
    medium: painting.medium ?? "Acrylic",
    sizeLabel: (painting.size_label as PaperSize) || "",
    width: painting.width != null ? String(painting.width) : "",
    height: painting.height != null ? String(painting.height) : "",
    isFramed: painting.is_framed,
    status: painting.status,
    featured: painting.featured,
  };
}

export function PaintingForm({ painting }: { painting?: PaintingWithImages }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    painting ? fromPainting(painting) : emptyForm(),
  );
  const createdOn = useMemo(
    () => (painting ? new Date(painting.created_at) : new Date()),
    [painting],
  );
  const generatedSlug = slugFromTitleAndDate(form.title, createdOn);
  const [images, setImages] = useState<ImageDraft[]>(() =>
    (painting?.painting_images ?? []).map((image) => ({
      key: image.id,
      id: image.id,
      previewUrl: image.image_url,
      imageUrl: image.image_url,
      storagePath: image.storage_path,
      isPreview: image.is_preview,
    })),
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const paintingId = useMemo(
    () => painting?.id ?? crypto.randomUUID(),
    [painting?.id],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onTitleChange(value: string) {
    update("title", value);
  }

  function onSizeChange(size: PaperSize | "") {
    update("sizeLabel", size);
    if (size) {
      update("width", String(PAPER_SIZES[size].width));
      update("height", String(PAPER_SIZES[size].height));
    }
  }

  function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next = Array.from(fileList).map((file) => ({
      key: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      isPreview: false,
    }));
    setImages((current) => [...current.filter((image) => !image.remove), ...next]);
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const visible = current.filter((image) => !image.remove);
      const target = index + direction;
      if (target < 0 || target >= visible.length) return current;
      const copy = [...visible];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      const removed = current.filter((image) => image.remove);
      return [...copy, ...removed];
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const price = Number(form.price);
    const framedPrice = form.framedPrice ? Number(form.framedPrice) : null;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid unframed price.");
      return;
    }
    if (framedPrice != null && (!Number.isFinite(framedPrice) || framedPrice < 0)) {
      setError("Enter a valid framed price, or leave it empty.");
      return;
    }

    const visibleImages = images.filter((image) => !image.remove);
    setPending(true);
    const supabase = createClient();

    let slug = painting?.slug || generatedSlug;
    const payload = {
      id: paintingId,
      title: form.title.trim(),
      slug,
      description: form.description.trim() || null,
      price,
      framed_price: framedPrice,
      currency: form.currency,
      medium: form.medium || null,
      width: form.width ? Number(form.width) : null,
      height: form.height ? Number(form.height) : null,
      size_label: form.sizeLabel || null,
      is_framed: form.isFramed,
      status: form.status,
      featured: form.featured,
    };

    let { error: upsertError } = await supabase.from("paintings").upsert(payload);
    if (upsertError?.code === "23505" && !painting) {
      const stamp = `${String(createdOn.getHours()).padStart(2, "0")}${String(createdOn.getMinutes()).padStart(2, "0")}`;
      slug = `${generatedSlug}-${stamp}`;
      payload.slug = slug;
      ({ error: upsertError } = await supabase.from("paintings").upsert(payload));
    }
    if (upsertError) {
      setPending(false);
      setError(
        upsertError.code === "23505"
          ? "A painting with this title was already added today. Change the title slightly."
          : upsertError.message,
      );
      return;
    }

    const removed = images.filter((image) => image.remove && image.id);
    if (removed.length) {
      const paths = removed
        .map((image) => image.storagePath)
        .filter((path): path is string => Boolean(path));
      if (paths.length) {
        await supabase.storage.from("paintings").remove(paths);
      }
      await supabase
        .from("painting_images")
        .delete()
        .in(
          "id",
          removed.map((image) => image.id as string),
        );
    }

    for (const [index, image] of visibleImages.entries()) {
      let imageUrl = image.imageUrl;
      let storagePath = image.storagePath ?? null;

      if (image.file) {
        const safeName = image.file.name.replace(/[^\w.\-]+/g, "-");
        storagePath = `${paintingId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("paintings")
          .upload(storagePath, image.file, { upsert: false });
        if (uploadError) {
          setPending(false);
          setError(uploadError.message);
          return;
        }
        const { data } = supabase.storage.from("paintings").getPublicUrl(storagePath);
        imageUrl = data.publicUrl;
      }

      if (!imageUrl) continue;

      const row = {
        id: image.id ?? crypto.randomUUID(),
        painting_id: paintingId,
        image_url: imageUrl,
        storage_path: storagePath,
        sort_order: index,
        is_preview: image.isPreview,
      };

      const { error: imageError } = await supabase.from("painting_images").upsert(row);
      if (imageError) {
        setPending(false);
        setError(imageError.message);
        return;
      }
    }

    router.push("/paintings");
    router.refresh();
  }

  const visibleImages = images.filter((image) => !image.remove);

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title" htmlFor="title">
          <input
            id="title"
            required
            value={form.title}
            onChange={(event) => onTitleChange(event.target.value)}
            className={inputClass}
          />
          {form.title.trim() ? (
            <p className="mt-1 text-xs text-slate-500">
              URL slug: {painting?.slug || generatedSlug}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Slug is generated from the title and today&apos;s date.
            </p>
          )}
        </Field>
        <Field label="Unframed price" htmlFor="price">
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            required
            value={form.price}
            onChange={(event) => update("price", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Framed price (optional)" htmlFor="framedPrice">
          <input
            id="framedPrice"
            type="number"
            min="0"
            step="1"
            value={form.framedPrice}
            onChange={(event) => update("framedPrice", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Currency" htmlFor="currency">
          <select
            id="currency"
            value={form.currency}
            onChange={(event) => update("currency", event.target.value)}
            className={inputClass}
          >
            <option value="INR">INR</option>
          </select>
        </Field>
        <Field label="Medium" htmlFor="medium">
          <select
            id="medium"
            value={form.medium}
            onChange={(event) => update("medium", event.target.value)}
            className={inputClass}
          >
            {MEDIUMS.map((medium) => (
              <option key={medium} value={medium}>
                {medium}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Size" htmlFor="size">
          <select
            id="size"
            value={form.sizeLabel}
            onChange={(event) => onSizeChange(event.target.value as PaperSize | "")}
            className={inputClass}
          >
            <option value="">Custom</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="A2">A2</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width (mm)" htmlFor="width">
            <input
              id="width"
              type="number"
              min="0"
              value={form.width}
              onChange={(event) => update("width", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Height (mm)" htmlFor="height">
            <input
              id="height"
              type="number"
              min="0"
              value={form.height}
              onChange={(event) => update("height", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          rows={5}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFramed}
            onChange={(event) => update("isFramed", event.target.checked)}
          />
          Currently framed
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />
          Featured on home
        </label>
        <label className="flex items-center gap-2">
          Status
          <select
            value={form.status}
            onChange={(event) => update("status", event.target.value as PaintingStatus)}
            className={inputClass}
          >
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Images</legend>
        <p className="mt-1 text-sm text-slate-500">
          Choose files here. They are uploaded to Supabase Storage when you
          save. The first gallery image is the cover. Tick Preview for wall or
          mock-up photos.
        </p>
        <label htmlFor="painting-images" className="mt-4 block text-sm font-medium text-slate-700">
          Upload images
        </label>
        <input
          id="painting-images"
          className="mt-1 block w-full text-sm"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <ul className="mt-4 grid gap-3">
          {visibleImages.map((image, index) => (
            <li
              key={image.key}
              className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt=""
                className="h-20 w-16 rounded object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={image.isPreview}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((item) =>
                          item.key === image.key
                            ? { ...item, isPreview: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  Preview image
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="rounded border border-slate-300 px-2 py-1"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="rounded border border-slate-300 px-2 py-1"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImages((current) =>
                        current.map((item) =>
                          item.key === image.key ? { ...item, remove: true } : item,
                        ),
                      )
                    }
                    className="rounded px-2 py-1 text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </fieldset>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : painting ? "Save painting" : "Create painting"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900";
