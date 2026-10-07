import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  // Honeypot: silently accept bot submissions without saving them.
  if (typeof input.website === "string" && input.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = typeof input.name === "string" ? input.name.trim().slice(0, 120) : "";
  const phone = typeof input.phone === "string" ? input.phone.trim().slice(0, 60) : "";
  const email = typeof input.email === "string" ? input.email.trim().slice(0, 180) : "";
  const interest = typeof input.interest === "string" ? input.interest.trim().slice(0, 180) : "Laptop recommendation";
  const message = typeof input.message === "string" ? input.message.trim().slice(0, 3000) : "";

  if (name.length < 2 || phone.length < 7 || message.length < 4) {
    return NextResponse.json({ error: "Add your name, a reachable phone number, and a short message." }, { status: 400 });
  }

  await getDb().insert(inquiries).values({ name, phone, email, interest, message });
  return NextResponse.json({ success: true }, { status: 201 });
}
