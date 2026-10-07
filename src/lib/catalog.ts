import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { coupons, orders, products, siteSettings } from "@/db/schema";
import { couponIsCurrentlyActive } from "@/lib/coupons";

export type ProductRecord = typeof products.$inferSelect;
export type SiteSettingsRecord = typeof siteSettings.$inferSelect;
export type ProductSeed = typeof products.$inferInsert;

const defaultCoupon: typeof coupons.$inferInsert = {
  code: "WELCOME5",
  label: "5% welcome discount",
  description: "Save 5% on your first website order.",
  discountType: "percent",
  discountValue: 5,
  minimumOrder: 50000,
  maximumDiscount: 15000,
  isActive: true,
};

const sourceImages = {
  upright: "https://syssolutionspk.com/wp-content/uploads/2026/02/Laptop-2-683x1024.png",
  squareOne: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.51-AM-1-1024x1024.jpeg",
  squareTwo: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.51-AM-1024x1024.jpeg",
};

export const defaultProducts: ProductSeed[] = [
  {
    slug: "hp-pavilion-plus-14",
    name: "HP Pavilion Plus 14",
    brand: "HP",
    category: "Creator",
    processor: "Intel Core i5-13500H",
    memory: "16GB RAM",
    storage: "1TB SSD",
    graphics: "Intel Iris Xe",
    display: "14\" 2.8K OLED",
    conditionLabel: "Quality checked",
    badge: "OLED display",
    promotionLabel: "5% OFF WITH WELCOME5",
    imageUrl: sourceImages.squareOne,
    description: "A sharp, colour-rich OLED screen and fast everyday performance in a portable 14-inch laptop.",
    price: 199000,
    isFeatured: true,
    isNewArrival: true,
    isTrending: false,
    isAvailable: true,
    sortOrder: 10,
  },
  {
    slug: "lenovo-yoga-pro-14s",
    name: "Lenovo Yoga Pro 14s",
    brand: "Lenovo",
    category: "Creator",
    processor: "Intel Core i9-12900H",
    memory: "32GB DDR5",
    storage: "Fast SSD storage",
    graphics: "NVIDIA GeForce RTX 3050",
    display: "14\" 3K display",
    conditionLabel: "Quality checked",
    badge: "Creator pick",
    promotionLabel: "LIMITED STOCK",
    imageUrl: sourceImages.upright,
    description: "A powerful, high-resolution creative machine for demanding projects and multitasking.",
    price: 295000,
    isFeatured: true,
    isNewArrival: true,
    isTrending: true,
    isAvailable: true,
    sortOrder: 20,
  },
  {
    slug: "dell-precision-3570",
    name: "Dell Precision 3570",
    brand: "Dell",
    category: "Workstation",
    processor: "Intel Core i7-1265U",
    memory: "16GB DDR5",
    storage: "Fast SSD storage",
    graphics: "NVIDIA T550",
    display: "15.6\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Mobile workstation",
    promotionLabel: "PRO PICK",
    imageUrl: sourceImages.squareTwo,
    description: "Professional-grade graphics and a roomy display for design, engineering and business workflows.",
    price: 209000,
    isFeatured: true,
    isNewArrival: false,
    isTrending: true,
    isAvailable: true,
    sortOrder: 30,
  },
  {
    slug: "dell-latitude-5510",
    name: "Dell Latitude 5510",
    brand: "Dell",
    category: "Business",
    processor: "Intel Core i7-10610U",
    memory: "8GB DDR4",
    storage: "256GB SSD",
    graphics: "Intel integrated graphics",
    display: "15.6\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Business ready",
    promotionLabel: "",
    imageUrl: sourceImages.upright,
    description: "A dependable business-class laptop with a spacious display and responsive solid-state storage.",
    price: 98900,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 40,
  },
  {
    slug: "lenovo-thinkpad-x13",
    name: "Lenovo ThinkPad X13",
    brand: "Lenovo",
    category: "Business",
    processor: "AMD Ryzen 5 PRO 4650U",
    memory: "16GB DDR4",
    storage: "256GB SSD",
    graphics: "AMD Radeon integrated graphics",
    display: "13.3\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Portable pick",
    promotionLabel: "TRENDING",
    imageUrl: sourceImages.squareOne,
    description: "A compact, capable companion for getting work done on the move.",
    price: 114900,
    isFeatured: false,
    isNewArrival: false,
    isTrending: true,
    isAvailable: true,
    sortOrder: 50,
  },
  {
    slug: "hp-zbook-15-g6",
    name: "HP ZBook 15 G6",
    brand: "HP",
    category: "Workstation",
    processor: "Intel Core i9-9880H",
    memory: "32GB DDR4",
    storage: "1TB SSD",
    graphics: "NVIDIA Quadro RTX 3000 6GB",
    display: "15.6\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Pro workstation",
    promotionLabel: "",
    imageUrl: sourceImages.squareTwo,
    description: "A serious mobile workstation built for resource-heavy professional applications.",
    price: 269000,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 60,
  },
];

export const defaultSettings: typeof siteSettings.$inferInsert = {
  id: 1,
  initialized: false,
  announcement: "Tested laptops, straight answers — visit us in Rawalpindi or shop on WhatsApp.",
  headline: "The right laptop.\nNo guesswork.",
  subheadline: "Carefully checked laptops for students, creators and teams — matched to the way you work and what you want to spend.",
  phone: "+92 331 5543897",
  email: "info@syssolutionspk.com",
  address: "Shop 36, 2nd floor, TechnoCity II, 6th Road, Rawalpindi",
};

export async function ensureStoreSeeded() {
  const db = getDb();
  const [existingSettings] = await db
    .select({ id: siteSettings.id, initialized: siteSettings.initialized })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (!existingSettings) {
    await db.insert(siteSettings).values(defaultSettings).onConflictDoNothing();
  }

  const [currentSettings] = await db
    .select({ id: siteSettings.id, initialized: siteSettings.initialized })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (currentSettings && !currentSettings.initialized) {
    await db.insert(products).values(defaultProducts).onConflictDoNothing();
    await db
      .update(siteSettings)
      .set({ initialized: true, updatedAt: new Date() })
      .where(eq(siteSettings.id, 1));
  }

  for (const product of defaultProducts) {
    if (!product.slug || product.price == null) continue;
    await db
      .update(products)
      .set({ price: product.price })
      .where(and(eq(products.slug, product.slug), isNull(products.price)));
  }

  await db.insert(coupons).values(defaultCoupon).onConflictDoNothing();
}

export async function getStoreSettings(): Promise<SiteSettingsRecord> {
  await ensureStoreSeeded();
  const db = getDb();
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  if (!settings) throw new Error("Store settings could not be loaded.");
  return settings;
}

export async function getAvailableProducts() {
  await ensureStoreSeeded();
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(eq(products.isAvailable, true))
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
}

export async function getAdminProducts() {
  await ensureStoreSeeded();
  const db = getDb();
  return db.select().from(products).orderBy(asc(products.sortOrder), desc(products.createdAt));
}

export async function getAdminOrders() {
  await ensureStoreSeeded();
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
}

export async function getActiveCoupons() {
  await ensureStoreSeeded();
  const db = getDb();
  const rows = await db.select().from(coupons).where(eq(coupons.isActive, true)).orderBy(desc(coupons.createdAt));
  return rows.filter((coupon) => couponIsCurrentlyActive(coupon));
}

export async function getAdminCoupons() {
  await ensureStoreSeeded();
  const db = getDb();
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}
