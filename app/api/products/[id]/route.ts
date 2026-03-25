import { NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, description, price, category, size, era, image_url, stock, featured } = body;

  const ok = updateProduct(parseInt(id), {
    name, description: description || "", price, category,
    size: size || "", era: era || "", image_url: image_url || "",
    stock: stock || 0, featured: featured || 0,
  });

  if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  deleteProduct(parseInt(id));
  return NextResponse.json({ success: true });
}
