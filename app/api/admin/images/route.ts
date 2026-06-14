import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addProductImage, getProductImages, reorderProductImages } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const productId = parseInt(searchParams.get("product_id") ?? "0");
  if (!productId) return NextResponse.json({ error: "product_id required" }, { status: 400 });
  const images = await getProductImages(productId);
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { product_id, path, url, is_primary, width, height } = body;
  if (!product_id || !path || !url) {
    return NextResponse.json({ error: "product_id, path, and url are required" }, { status: 400 });
  }
  const existing = await getProductImages(product_id);
  const position = existing.length;
  const image = await addProductImage({
    product_id, path, url, position,
    is_primary: is_primary ?? position === 0,
    width: width ?? null,
    height: height ?? null,
  });
  return NextResponse.json({ image }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { product_id, ordered_ids } = await request.json();
  if (!product_id || !ordered_ids) {
    return NextResponse.json({ error: "product_id and ordered_ids required" }, { status: 400 });
  }
  await reorderProductImages(product_id, ordered_ids);
  return NextResponse.json({ success: true });
}
