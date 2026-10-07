import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const subtotal = Number(body?.subtotal);
  if (!Number.isSafeInteger(subtotal) || subtotal < 1) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  const result = await validateCoupon(body?.code, subtotal);
  return NextResponse.json(result, { status: result.valid ? 200 : 400 });
}
