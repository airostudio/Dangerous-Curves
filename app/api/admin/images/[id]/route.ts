import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteProductImage, setPrimaryImage } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await deleteProductImage(parseInt(id));
  if (result?.path) {
    await supabase.storage.from("product-images").remove([result.path]);
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { product_id } = await request.json();
  await setPrimaryImage(product_id, parseInt(id));
  return NextResponse.json({ success: true });
}
