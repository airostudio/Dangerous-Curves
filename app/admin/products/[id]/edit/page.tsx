import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProductById } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const product = getProductById(parseInt(id));
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
