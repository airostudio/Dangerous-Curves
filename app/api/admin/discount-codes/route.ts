import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllDiscountCodes, createDiscountCode } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await getAllDiscountCodes();
  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, type, value, min_order, max_uses, expires_at } = await request.json();
  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: "code, type, and value are required" }, { status: 400 });
  }
  if (!["percentage", "fixed"].includes(type)) {
    return NextResponse.json({ error: "type must be percentage or fixed" }, { status: 400 });
  }

  const id = await createDiscountCode({
    code,
    type,
    value: parseInt(value),
    min_order: parseInt(min_order ?? 0),
    max_uses: max_uses ? parseInt(max_uses) : null,
    active: true,
    expires_at: expires_at || null,
  });

  return NextResponse.json({ id }, { status: 201 });
}
