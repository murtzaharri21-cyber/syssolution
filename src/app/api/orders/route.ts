import { randomBytes, randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { coupons, orders, products } from "@/db/schema";
import { normalizeCouponCode, validateCoupon } from "@/lib/coupons";

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function makeReceiptNumber() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `SYS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });

  const input = body as Record<string, unknown>;
  if (typeof input.website === "string" && input.website.trim()) return NextResponse.json({ success: true });

  const productId = Number(input.productId);
  const quantity = Number(input.quantity ?? 1);
  const fulfillment = readString(input.fulfillment, 24) || "pickup";
  const name = readString(input.name, 120);
  const phone = readString(input.phone, 60);
  const email = readString(input.email, 180);
  const city = readString(input.city, 120);
  const address = readString(input.address, 500);
  const notes = readString(input.notes, 2000);
  const requestedCoupon = normalizeCouponCode(input.couponCode);

  if (!Number.isInteger(productId) || productId < 1) return NextResponse.json({ error: "Choose a laptop to order." }, { status: 400 });
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) return NextResponse.json({ error: "Quantity should be between 1 and 5." }, { status: 400 });
  if (fulfillment !== "pickup" && fulfillment !== "delivery") return NextResponse.json({ error: "Choose shop pickup or delivery." }, { status: 400 });
  if (name.length < 2 || phone.length < 7) return NextResponse.json({ error: "Add your name and a reachable phone number." }, { status: 400 });
  if (fulfillment === "delivery" && address.length < 8) return NextResponse.json({ error: "Add a delivery address so we can reach you." }, { status: 400 });

  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || !product.isAvailable) return NextResponse.json({ error: "That laptop is no longer available." }, { status: 404 });
  if (product.price === null || product.price < 1) return NextResponse.json({ error: "This laptop cannot be ordered just yet." }, { status: 400 });

  const productPrice = product.price;
  const subtotal = productPrice * quantity;
  let couponCode = "";
  let discountAmount = 0;
  if (requestedCoupon) {
    const couponResult = await validateCoupon(requestedCoupon, subtotal);
    if (!couponResult.valid) return NextResponse.json({ error: couponResult.message }, { status: 400 });
    couponCode = couponResult.code;
    discountAmount = couponResult.discountAmount;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);
  const receiptNumber = makeReceiptNumber();
  const receiptToken = randomUUID();

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        receiptNumber,
        receiptToken,
        productId: product.id,
        productName: product.name,
        productPrice,
        quantity,
        subtotal,
        couponCode,
        discountAmount,
        totalAmount,
        fulfillment,
        name,
        phone,
        email,
        city,
        address,
        notes,
      })
      .returning({ id: orders.id });

    if (couponCode) {
      await tx
        .update(coupons)
        .set({ timesUsed: sql`${coupons.timesUsed} + 1` })
        .where(eq(coupons.code, couponCode));
    }
    return created;
  });

  return NextResponse.json({
    success: true,
    orderId: order.id,
    receiptNumber,
    receiptToken,
    subtotal,
    discountAmount,
    totalAmount,
    couponCode,
  }, { status: 201 });
}
