import type { CouponRecord } from "@/db/schema";
import { normalizeCouponCode } from "@/lib/coupons";

export type CouponPayload = Omit<CouponRecord, "id" | "timesUsed" | "createdAt">;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function optionalPositiveInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function optionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseCouponPayload(value: unknown): CouponPayload | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const code = normalizeCouponCode(input.code);
  const label = text(input.label, 100);
  const discountType = input.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(input.discountValue);
  const minimumOrder = Math.max(0, Number(input.minimumOrder) || 0);
  const maximumDiscount = optionalPositiveInteger(input.maximumDiscount);
  const usageLimit = optionalPositiveInteger(input.usageLimit);
  const startsAt = optionalDate(input.startsAt);
  const expiresAt = optionalDate(input.expiresAt);

  if (!code || !label || !Number.isSafeInteger(discountValue) || discountValue < 1) return null;
  if (discountType === "percent" && discountValue > 100) return null;
  if (!Number.isSafeInteger(minimumOrder)) return null;
  if (startsAt && expiresAt && startsAt >= expiresAt) return null;

  return {
    code,
    label,
    description: text(input.description, 1000),
    discountType,
    discountValue,
    minimumOrder,
    maximumDiscount,
    isActive: input.isActive !== false && input.isActive !== "false",
    startsAt,
    expiresAt,
    usageLimit,
  };
}
