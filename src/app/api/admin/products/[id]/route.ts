import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseProductPayload } from "@/lib/admin-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const payload = parseProductPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Add a name, brand, category, processor, memory, storage, and display." }, { status: 400 });
  }

  const db = getDb();
  const [product] = await db.update(products).set(payload).where(eq(products.id, id)).returning();
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const db = getDb();
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
