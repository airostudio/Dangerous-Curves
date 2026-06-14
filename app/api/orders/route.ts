import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { customer_name, customer_email, customer_address, items } = body;

  if (!customer_name || !customer_email || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await createOrder({
    customer_name,
    customer_email,
    customer_address: customer_address || "",
    items,
  });

  return NextResponse.json({ id }, { status: 201 });
}
