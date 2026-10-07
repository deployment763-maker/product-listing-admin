export type PaintingStatus = "AVAILABLE" | "SOLD";
export type PaperSize = "A2" | "A3" | "A4";
export type CurrencyCode = "INR";

export type Painting = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  framed_price: number | null;
  currency: string;
  medium: string | null;
  style: string | null;
  width: number | null;
  height: number | null;
  size_label: string | null;
  is_framed: boolean;
  status: PaintingStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type PaintingImage = {
  id: string;
  painting_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_preview: boolean;
  created_at: string;
};

export type PaintingWithImages = Painting & {
  painting_images: PaintingImage[];
};

export type Profile = {
  id: string;
  email: string | null;
  role: "ADMIN";
  created_at: string;
};

export const PAPER_SIZES: Record<
  PaperSize,
  { width: number; height: number; label: string }
> = {
  A4: { width: 210, height: 297, label: "A4 · 210 × 297 mm" },
  A3: { width: 297, height: 420, label: "A3 · 297 × 420 mm" },
  A2: { width: 420, height: 594, label: "A2 · 420 × 594 mm" },
};

export const MEDIUMS = [
  "Acrylic",
  "Watercolor",
  "Oil",
  "Ink",
  "Mixed media",
] as const;

export const STYLES = [
  "Misc",
  "Realism",
  "Impressionism",
  "Surrealism",
  "Cubism",
  "Expressionism",
] as const;

export const DEFAULT_STYLE = "Misc" as const;

export function formatPrice(
  amount: number | string | null | undefined,
  currency = "INR",
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value == null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugFromTitleAndDate(title: string, date = new Date()): string {
  const base = slugify(title) || "painting";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${base}-${year}-${month}-${day}`;
}

export function coverImage(
  images: PaintingImage[] | undefined,
): PaintingImage | undefined {
  if (!images?.length) return undefined;
  return [...images]
    .filter((image) => !image.is_preview)
    .sort((a, b) => a.sort_order - b.sort_order)[0] ?? [...images].sort(
    (a, b) => a.sort_order - b.sort_order,
  )[0];
}

export function galleryImages(images: PaintingImage[] | undefined): PaintingImage[] {
  if (!images?.length) return [];
  return [...images]
    .filter((image) => !image.is_preview)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function previewImages(images: PaintingImage[] | undefined): PaintingImage[] {
  if (!images?.length) return [];
  return [...images]
    .filter((image) => image.is_preview)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function whatsappEnquiryMessage(painting: {
  title: string;
  price?: number | string;
  framed_price?: number | string | null;
  currency?: string;
  frameOption?: "unframed" | "framed";
}): string {
  const isFramed = painting.frameOption === "framed";
  const frameNote = painting.frameOption
    ? isFramed
      ? " with frame"
      : " unframed"
    : "";
  return `Hi, I'm interested in the painting "${painting.title}"${frameNote}. Pricing is negotiable and customisable.`;
}

export function getSupabasePublicEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { url, key };
}
