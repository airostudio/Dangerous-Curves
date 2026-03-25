import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { customer_name, customer_email, customer_address, items } = body;

  if (!customer_name || !customer_email || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

  const orderResult = db.prepare(`
    INSERT INTO orders (customer_name, customer_email, customer_address, total)
    VALUES (?, ?, ?, ?)
  `).run(customer_name, customer_email, customer_address || "", total);

  const orderId = orderResult.lastInsertRowid;
  const itemStmt = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    itemStmt.run(orderId, item.product_id, item.product_name || "", item.quantity, item.price);
  }

  return NextResponse.json({ id: orderId }, { status: 201 });
}
