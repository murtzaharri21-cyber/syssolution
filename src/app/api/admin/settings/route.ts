import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureStoreSeeded } from "@/lib/catalog";

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  await ensureStoreSeeded();
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const announcement = readString(input.announcement, 240);
  const headline = readString(input.headline, 200);
  const subheadline = readString(input.subheadline, 1000);
  const phone = readString(input.phone, 80);
  const email = readString(input.email, 180);
  const address = readString(input.address, 500);

  if (!announcement || !headline || !subheadline || !phone || !email || !address) {
    return NextResponse.json({ error: "Please complete every site setting." }, { status: 400 });
  }

  await ensureStoreSeeded();
  const [settings] = await db
    .update(siteSettings)
    .set({ announcement, headline, subheadline, phone, email, address, updatedAt: new Date() })
    .where(eq(siteSettings.id, 1))
    .returning();
  return NextResponse.json(settings);
}
