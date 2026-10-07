import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseCouponPayload } from "@/lib/admin-coupon-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated(request))) return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  const id = Number((await params).id);
  const payload = parseCouponPayload(await request.json().catch(() => null));
  if (!Number.isInteger(id) || id < 1 || !payload) return NextResponse.json({ error: "Invalid coupon update." }, { status: 400 });

  const db = getDb();
  try {
    const [coupon] = await db.update(coupons).set(payload).where(eq(coupons.id, id)).returning();
    if (!coupon) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "That coupon code already exists." }, { status: 409 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated(request))) return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid coupon." }, { status: 400 });
  const db = getDb();
  const [deleted] = await db.delete(coupons).where(eq(coupons.id, id)).returning({ id: coupons.id });
  if (!deleted) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
