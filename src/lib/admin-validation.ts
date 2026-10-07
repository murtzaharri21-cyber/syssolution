import type { ProductRecord } from "@/db/schema";

export type ProductPayload = Omit<
  ProductRecord,
  "id" | "slug" | "createdAt"
>;

function text(value: unknown, maxLength: number, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, maxLength);
}

export function parseProductPayload(value: unknown): ProductPayload | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 180);
  const brand = text(input.brand, 80);
  const category = text(input.category, 80);
  const processor = text(input.processor, 180);
  const memory = text(input.memory, 100);
  const storage = text(input.storage, 100);
  const display = text(input.display, 140);
  const price = Number(input.price);

  if (!name || !brand || !category || !processor || !memory || !storage || !display) return null;
  if (!Number.isSafeInteger(price) || price < 1) return null;

  return {
    name,
    brand,
    category,
    processor,
    memory,
    storage,
    graphics: text(input.graphics, 180, "Integrated graphics") || "Integrated graphics",
    display,
    conditionLabel: text(input.conditionLabel, 100, "Quality checked") || "Quality checked",
    badge: text(input.badge, 80, "Verified stock") || "Verified stock",
    promotionLabel: text(input.promotionLabel, 80),
    imageUrl: text(input.imageUrl, 1200),
    description: text(input.description, 2000),
    price,
    isFeatured: input.isFeatured === true || input.isFeatured === "true",
    isNewArrival: input.isNewArrival === true || input.isNewArrival === "true",
    isTrending: input.isTrending === true || input.isTrending === "true",
    isAvailable: input.isAvailable !== false && input.isAvailable !== "false",
    sortOrder: Number.isSafeInteger(Number(input.sortOrder)) ? Number(input.sortOrder) : 100,
  };
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
  return slug || "laptop";
}
