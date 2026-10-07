import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminCredentialsAreConfigured,
  createAdminSession,
  passwordsMatch,
  userIdsMatch,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminCredentialsAreConfigured()) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured. Add ADMIN_USER_ID, a 12+ character ADMIN_PASSWORD, and ADMIN_SESSION_SECRET to the server environment." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const userIdMatches = userIdsMatch(body?.userId);
  const passwordMatches = passwordsMatch(body?.password);
  if (!userIdMatches || !passwordMatches) {
    return NextResponse.json({ error: "That User ID or password did not match. Please try again." }, { status: 401 });
  }

  const session = createAdminSession();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, session, adminCookieOptions);
  return NextResponse.json({ success: true, session });
}
