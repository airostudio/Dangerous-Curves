import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const db = getDb();
  const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all() as Product[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rockabilly text-3xl">Products</h1>
          <p className="mt-1 text-sm text-charcoal/60">{products.length} items in catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border-2 border-warm-gray bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-warm-gray bg-cream text-left">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Product</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Category</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Price</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Stock</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-gray-light">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-cream/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-charcoal/50">{p.era} &middot; Size {p.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.category}</Badge>
                </td>
                <td className="px-4 py-3 font-bold text-cherry">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    p.stock === 0 ? "bg-cherry/10 text-cherry" : p.stock <= 2 ? "bg-gold/20 text-gold" : "bg-teal/10 text-teal"
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteProductButton productId={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
