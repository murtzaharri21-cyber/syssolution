import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseCouponPayload } from "@/lib/admin-coupon-validation";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated(request))) return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  const payload = parseCouponPayload(await request.json().catch(() => null));
  if (!payload) return NextResponse.json({ error: "Add a valid code, label, and discount value." }, { status: 400 });

  try {
    const [coupon] = await db.insert(coupons).values(payload).returning();
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That coupon code already exists." }, { status: 409 });
  }
}
