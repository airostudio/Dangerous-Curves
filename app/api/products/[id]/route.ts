import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, description, price, category, size, era, image_url, stock, featured } = body;

  const db = getDb();
  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, category=?, size=?, era=?, image_url=?, stock=?, featured=?
    WHERE id=?
  `).run(name, description || "", price, category, size || "", era || "", image_url || "", stock || 0, featured || 0, parseInt(id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(parseInt(id));

  return NextResponse.json({ success: true });
}
