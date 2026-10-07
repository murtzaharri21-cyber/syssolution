import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return NextResponse.json({ success: true });
}
