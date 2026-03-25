import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, price, category, size, era, image_url, stock, featured } = body;

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO products (name, description, price, category, size, era, image_url, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description || "", price, category, size || "", era || "", image_url || "", stock || 0, featured || 0);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
