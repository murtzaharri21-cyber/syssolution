import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPasswordIsConfigured,
  createAdminSession,
  passwordsMatch,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminPasswordIsConfigured()) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured. Add a 12+ character ADMIN_PASSWORD and an ADMIN_SESSION_SECRET to the server environment." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!passwordsMatch(body?.password)) {
    return NextResponse.json({ error: "That password did not match. Please try again." }, { status: 401 });
  }

  const session = createAdminSession();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, session, adminCookieOptions);
  return NextResponse.json({ success: true, session });
}
