import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const db = getDb();
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(parseInt(id)) as Product | undefined;
  if (!product) notFound();

  return (
    <div className="p-8">
      <h1 className="font-rockabilly text-3xl">Edit Product</h1>
      <p className="mt-1 text-sm text-charcoal/60">Update {product.name}</p>
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
