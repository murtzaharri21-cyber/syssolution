import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
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
  hpPavilion: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.51-AM-1.jpeg",
  lenovoYoga: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.55-AM-2.jpeg",
  dellLatitude5510: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.57-AM-1.jpeg",
  lenovoThinkPadL13: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.58-AM.jpeg",
  dellPrecision3570: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.59-AM.jpeg",
  lenovoThinkPadX13: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.59-AM-1.jpeg",
  dellLatitude7210: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.00-AM.jpeg",
  dellLatitude5591: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.01-AM.jpeg",
  hpEliteX2G8: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.02-AM.jpeg",
  dellG33590: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.03-AM.jpeg",
  hpZBookStudioG5: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.04-AM.jpeg",
  hpProBook450G8: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.04-AM-1.jpeg",
  hpZBook15G6: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.05-AM-1.jpeg",
  hpZBook15G5: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.05-AM.jpeg",
  hpProBook445G8: "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.59.07-AM.jpeg",
};

const replacedSeedImageUrls = [
  "https://syssolutionspk.com/wp-content/uploads/2026/02/Laptop-2-683x1024.png",
  "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.51-AM-1-1024x1024.jpeg",
  "https://syssolutionspk.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-02-23-at-9.58.51-AM-1024x1024.jpeg",
];

export const defaultProducts: ProductSeed[] = [
  {
    slug: "hp-pavilion-plus-14",
    name: "HP Pavilion Plus 14",
    brand: "HP",
    category: "Creator",
    processor: "Intel Core i5-13500H",
    memory: "16GB RAM",
    storage: "1TB SSD",
    graphics: "Not specified by seller",
    display: "14\" 2.8K OLED",
    conditionLabel: "Quality checked",
    badge: "OLED display",
    promotionLabel: "5% OFF WITH WELCOME5",
    imageUrl: sourceImages.hpPavilion,
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
    storage: "Not specified by seller",
    graphics: "NVIDIA GeForce RTX 3050",
    display: "14\" 3K display",
    conditionLabel: "Quality checked",
    badge: "Creator pick",
    promotionLabel: "LIMITED STOCK",
    imageUrl: sourceImages.lenovoYoga,
    description: "A high-resolution creative laptop with Core i9 performance, RTX 3050 graphics and a 3K display.",
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
    storage: "Not specified by seller",
    graphics: "NVIDIA T550",
    display: "15.6\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Mobile workstation",
    promotionLabel: "PRO PICK",
    imageUrl: sourceImages.dellPrecision3570,
    description: "Professional-grade graphics and a roomy display for design, engineering and business workflows.",
    price: 209000,
    isFeatured: true,
    isNewArrival: false,
    isTrending: true,
    isAvailable: true,
    sortOrder: 50,
  },
  {
    slug: "dell-latitude-5510",
    name: "Dell Latitude 5510",
    brand: "Dell",
    category: "Business",
    processor: "Intel Core i7-10610U",
    memory: "8GB DDR4",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "15.6\" Full HD",
    conditionLabel: "Excellent condition",
    badge: "Business ready",
    promotionLabel: "",
    imageUrl: sourceImages.dellLatitude5510,
    description: "A dependable business-class laptop with a spacious display and responsive solid-state storage.",
    price: 98900,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 30,
  },
  {
    slug: "lenovo-thinkpad-x13",
    name: "Lenovo ThinkPad X13",
    brand: "Lenovo",
    category: "Business",
    processor: "AMD Ryzen 5 PRO 4650U",
    memory: "16GB DDR4",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "13.3\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Portable pick",
    promotionLabel: "TRENDING",
    imageUrl: sourceImages.lenovoThinkPadX13,
    description: "A compact, capable companion for getting work done on the move.",
    price: 114900,
    isFeatured: false,
    isNewArrival: false,
    isTrending: true,
    isAvailable: true,
    sortOrder: 60,
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
    display: "Not specified by seller",
    conditionLabel: "Quality checked",
    badge: "Pro workstation",
    promotionLabel: "",
    imageUrl: sourceImages.hpZBook15G6,
    description: "A serious mobile workstation built for resource-heavy professional applications.",
    price: 269000,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 130,
  },
  {
    slug: "lenovo-thinkpad-l13",
    name: "Lenovo ThinkPad L13",
    brand: "Lenovo",
    category: "Business",
    processor: "Intel Core i5 12th Gen",
    memory: "8GB RAM",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "13.3\" Full HD",
    conditionLabel: "Quality checked",
    badge: "Original charger",
    promotionLabel: "",
    imageUrl: sourceImages.lenovoThinkPadL13,
    description: "12th Gen Core i5, original charger, 8GB RAM, 256GB SSD and a 13.3-inch FHD display.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 40,
  },
  {
    slug: "dell-latitude-7210",
    name: "Dell Latitude 7210",
    brand: "Dell",
    category: "Detachable",
    processor: "Intel Core i5-10310U",
    memory: "16GB RAM",
    storage: "Not specified by seller",
    graphics: "Not specified by seller",
    display: "12.3\" Touchscreen",
    conditionLabel: "Quality checked",
    badge: "Detachable touchscreen",
    promotionLabel: "",
    imageUrl: sourceImages.dellLatitude7210,
    description: "A detachable keyboard laptop with a 12.3-inch touchscreen, Core i5-10310U and 16GB RAM.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 70,
  },
  {
    slug: "dell-latitude-5591",
    name: "Dell Latitude 5591",
    brand: "Dell",
    category: "Business",
    processor: "Intel Core i7 8th Gen H-series",
    memory: "8GB DDR4",
    storage: "Not specified by seller",
    graphics: "NVIDIA MX130",
    display: "15.6\" Full HD",
    conditionLabel: "Quality checked",
    badge: "i7 H-series · MX130",
    promotionLabel: "",
    imageUrl: sourceImages.dellLatitude5591,
    description: "8th Gen Core i7 H-series, NVIDIA MX130 graphics, 8GB DDR4 and a 15.6-inch FHD display.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 80,
  },
  {
    slug: "hp-elite-x2-g8",
    name: "HP Elite x2 G8",
    brand: "HP",
    category: "Detachable",
    processor: "Intel Core i5-1135G7",
    memory: "16GB RAM",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "13\" Touchscreen · 400 nits",
    conditionLabel: "Quality checked",
    badge: "Tablet mode",
    promotionLabel: "",
    imageUrl: sourceImages.hpEliteX2G8,
    description: "Tablet-style detachable with a 13-inch, 400-nit touchscreen, Core i5-1135G7, 16GB RAM and 256GB SSD.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 90,
  },
  {
    slug: "dell-g3-3590",
    name: "Dell G3 3590",
    brand: "Dell",
    category: "Gaming",
    processor: "Intel Core i7-9750H",
    memory: "16GB RAM",
    storage: "256GB + 1TB (drive types not specified)",
    graphics: "NVIDIA GeForce GTX 1660 Ti",
    display: "Not specified by seller",
    conditionLabel: "10/10 condition",
    badge: "Gaming laptop",
    promotionLabel: "",
    imageUrl: sourceImages.dellG33590,
    description: "Gaming laptop in 10/10 condition with Core i7-9750H, 16GB RAM, GTX 1660 Ti and 256GB + 1TB storage.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 100,
  },
  {
    slug: "hp-zbook-studio-g5",
    name: "HP ZBook Studio G5",
    brand: "HP",
    category: "Workstation",
    processor: "Intel Core i7-8850H",
    memory: "16GB DDR4",
    storage: "Not specified by seller",
    graphics: "NVIDIA Quadro P1000 4GB",
    display: "15.6\" Full HD",
    conditionLabel: "Open box",
    badge: "Quadro P1000",
    promotionLabel: "",
    imageUrl: sourceImages.hpZBookStudioG5,
    description: "Open-box workstation with Core i7-8850H, 16GB DDR4, 4GB Quadro P1000 and a 15.6-inch FHD display.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 110,
  },
  {
    slug: "hp-probook-450-g8",
    name: "HP ProBook 450 G8",
    brand: "HP",
    category: "Business",
    processor: "Intel Core i5-1135G7",
    memory: "16GB RAM",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "Not specified by seller",
    conditionLabel: "Quality checked",
    badge: "Silver · Fingerprint",
    promotionLabel: "",
    imageUrl: sourceImages.hpProBook450G8,
    description: "Silver ProBook with Core i5-1135G7, 16GB RAM, 256GB SSD and a fingerprint reader.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 120,
  },
  {
    slug: "hp-zbook-15-g5",
    name: "HP ZBook 15 G5",
    brand: "HP",
    category: "Workstation",
    processor: "Intel Core i7-8850H",
    memory: "32GB RAM",
    storage: "256GB SSD",
    graphics: "NVIDIA Quadro P2000",
    display: "Not specified by seller",
    conditionLabel: "Quality checked",
    badge: "Quadro P2000",
    promotionLabel: "",
    imageUrl: sourceImages.hpZBook15G5,
    description: "Mobile workstation with Core i7-8850H, 32GB RAM, Quadro P2000 graphics and a 256GB SSD.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 140,
  },
  {
    slug: "hp-probook-445-g8",
    name: "HP ProBook 445 G8",
    brand: "HP",
    category: "Business",
    processor: "AMD Ryzen 7 5800U",
    memory: "8GB RAM",
    storage: "256GB SSD",
    graphics: "Not specified by seller",
    display: "Not specified by seller",
    conditionLabel: "Excellent condition",
    badge: "Ryzen 7 · Business",
    promotionLabel: "",
    imageUrl: sourceImages.hpProBook445G8,
    description: "Business laptop in excellent condition with Ryzen 7 5800U, 8GB RAM and a 256GB SSD.",
    price: null,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isAvailable: true,
    sortOrder: 150,
  },
];

const sourceCatalogProductSlugs = new Set([
  "lenovo-thinkpad-l13",
  "dell-latitude-7210",
  "dell-latitude-5591",
  "hp-elite-x2-g8",
  "dell-g3-3590",
  "hp-zbook-studio-g5",
  "hp-probook-450-g8",
  "hp-zbook-15-g5",
  "hp-probook-445-g8",
]);

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

let storeSeedPromise: Promise<void> | undefined;

async function seedStore() {
  const db = getDb();
  const [existingSettings] = await db
    .select({ id: siteSettings.id, initialized: siteSettings.initialized })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (existingSettings?.initialized) {
    const sourceCatalogProducts = defaultProducts.filter((product) => sourceCatalogProductSlugs.has(product.slug));
    await db.insert(products).values(sourceCatalogProducts).onConflictDoNothing();
    for (const product of defaultProducts) {
      await db
        .update(products)
        .set({ imageUrl: product.imageUrl })
        .where(and(eq(products.slug, product.slug), inArray(products.imageUrl, replacedSeedImageUrls)));
    }
    return;
  }

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

export function ensureStoreSeeded() {
  if (!storeSeedPromise) {
    storeSeedPromise = seedStore().catch((error: unknown) => {
      storeSeedPromise = undefined;
      throw error;
    });
  }
  return storeSeedPromise;
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
