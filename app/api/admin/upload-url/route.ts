import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename } = await request.json();
  const ext = (filename as string).split(".").pop() ?? "webp";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUploadUrl(path);

  if (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl });
}
