import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-8">
      <h1 className="font-rockabilly text-3xl">Add Product</h1>
      <p className="mt-1 text-sm text-charcoal/60">Add a new piece to the collection</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
