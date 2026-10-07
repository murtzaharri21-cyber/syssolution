import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons, type CouponRecord } from "@/db/schema";

export type CouponResult = {
  valid: boolean;
  message: string;
  discountAmount: number;
  subtotal: number;
  total: number;
  code: string;
  label: string;
};

export function normalizeCouponCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40)
    : "";
}

export function couponIsCurrentlyActive(coupon: CouponRecord, now = new Date()) {
  if (!coupon.isActive) return false;
  if (coupon.startsAt && coupon.startsAt > now) return false;
  if (coupon.expiresAt && coupon.expiresAt < now) return false;
  if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) return false;
  return true;
}

export function calculateDiscount(coupon: CouponRecord, subtotal: number) {
  const raw = coupon.discountType === "fixed"
    ? coupon.discountValue
    : Math.floor(subtotal * coupon.discountValue / 100);
  const limited = coupon.maximumDiscount === null ? raw : Math.min(raw, coupon.maximumDiscount);
  return Math.max(0, Math.min(limited, subtotal));
}

export async function validateCoupon(codeInput: unknown, subtotal: number): Promise<CouponResult> {
  const code = normalizeCouponCode(codeInput);
  const invalid = (message: string): CouponResult => ({
    valid: false,
    message,
    discountAmount: 0,
    subtotal,
    total: subtotal,
    code,
    label: "",
  });

  if (!code) return invalid("Enter a coupon code.");
  if (!Number.isSafeInteger(subtotal) || subtotal < 1) return invalid("This order cannot use a coupon.");

  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  if (!coupon || !couponIsCurrentlyActive(coupon)) return invalid("That coupon is not active.");
  if (subtotal < coupon.minimumOrder) {
    return invalid(`This coupon needs a minimum order of PKR ${new Intl.NumberFormat("en-PK").format(coupon.minimumOrder)}.`);
  }

  const discountAmount = calculateDiscount(coupon, subtotal);
  return {
    valid: true,
    message: `${coupon.label} applied.`,
    discountAmount,
    subtotal,
    total: Math.max(0, subtotal - discountAmount),
    code: coupon.code,
    label: coupon.label,
  };
}
