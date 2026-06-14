import { NextResponse } from "next/server";
import { createProduct } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, price, category, size, era, image_url, stock, featured } = body;

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
  }

  const id = await createProduct({
    name, description: description || "", price, category,
    size: size || "", era: era || "", image_url: image_url || "",
    stock: stock || 0, featured: featured || 0,
  });

  return NextResponse.json({ id }, { status: 201 });
}
