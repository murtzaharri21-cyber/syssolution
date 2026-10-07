import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const allowedStatuses = new Set(["new", "contacted", "resolved"]);

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(100);
  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const status = body?.status;
  if (!Number.isInteger(id) || id < 1 || typeof status !== "string" || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid inquiry update." }, { status: 400 });
  }

  const [updated] = await db
    .update(inquiries)
    .set({ status })
    .where(eq(inquiries.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json(updated);
}
