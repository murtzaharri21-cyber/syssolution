import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  brand: varchar("brand", { length: 80 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  processor: varchar("processor", { length: 180 }).notNull(),
  memory: varchar("memory", { length: 100 }).notNull(),
  storage: varchar("storage", { length: 100 }).notNull(),
  graphics: varchar("graphics", { length: 180 }).notNull().default("Integrated graphics"),
  display: varchar("display", { length: 140 }).notNull(),
  conditionLabel: varchar("condition_label", { length: 100 }).notNull().default("Quality checked"),
  badge: varchar("badge", { length: 80 }).notNull().default("Verified stock"),
  promotionLabel: varchar("promotion_label", { length: 80 }).notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  description: text("description").notNull().default(""),
  price: integer("price"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().default(""),
  interest: varchar("interest", { length: 180 }).notNull().default("Laptop recommendation"),
  message: text("message").notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  description: text("description").notNull().default(""),
  discountType: varchar("discount_type", { length: 16 }).notNull().default("percent"),
  discountValue: integer("discount_value").notNull(),
  minimumOrder: integer("minimum_order").notNull().default(0),
  maximumDiscount: integer("maximum_discount"),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  usageLimit: integer("usage_limit"),
  timesUsed: integer("times_used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 40 }).notNull().default(""),
  receiptToken: varchar("receipt_token", { length: 80 }).unique(),
  productId: integer("product_id").notNull(),
  productName: varchar("product_name", { length: 180 }).notNull(),
  productPrice: integer("product_price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  subtotal: integer("subtotal").notNull().default(0),
  couponCode: varchar("coupon_code", { length: 40 }).notNull().default(""),
  discountAmount: integer("discount_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  fulfillment: varchar("fulfillment", { length: 24 }).notNull().default("pickup"),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().default(""),
  city: varchar("city", { length: 120 }).notNull().default(""),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  initialized: boolean("initialized").notNull().default(false),
  announcement: varchar("announcement", { length: 240 }).notNull(),
  headline: varchar("headline", { length: 200 }).notNull(),
  subheadline: text("subheadline").notNull(),
  phone: varchar("phone", { length: 80 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  address: text("address").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRecord = typeof products.$inferSelect;
export type InquiryRecord = typeof inquiries.$inferSelect;
export type CouponRecord = typeof coupons.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type SiteSettingsRecord = typeof siteSettings.$inferSelect;
