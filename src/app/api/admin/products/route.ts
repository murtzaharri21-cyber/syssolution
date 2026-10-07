import { randomUUID } from "node:crypto";
import { asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureStoreSeeded } from "@/lib/catalog";
import { parseProductPayload, slugify } from "@/lib/admin-validation";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  await ensureStoreSeeded();
  const db = getDb();
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder), desc(products.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const payload = parseProductPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Add a name, brand, category, processor, memory, storage, and display." }, { status: 400 });
  }

  const slug = `${slugify(payload.name)}-${randomUUID().slice(0, 8)}`;
  const db = getDb();
  const [product] = await db.insert(products).values({ ...payload, slug }).returning();
  return NextResponse.json(product, { status: 201 });
}
