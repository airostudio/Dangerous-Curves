import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllProducts } from "@/lib/db";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";
  const all = await getAllProducts();
  const products = q
    ? all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.era.toLowerCase().includes(q)
      )
    : all;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-3xl">Products</h1>
          <p className="mt-1 text-sm text-charcoal/60">{all.length} items in catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form className="mt-5">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-lg border-2 border-warm-gray bg-white px-4 py-2 text-sm focus:border-cherry focus:outline-none"
        />
      </form>

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border-2 border-warm-gray bg-white p-3 shadow-sm">
            {p.image_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.image_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              : <div className="h-14 w-14 shrink-0 rounded-lg bg-cream" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <p className="truncate font-bold text-sm">{p.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  p.stock === 0 ? "bg-cherry/10 text-cherry" : p.stock <= 2 ? "bg-gold/20 text-charcoal" : "bg-teal/10 text-teal-dark"
                }`}>{p.stock === 0 ? "Out" : `${p.stock} left`}</span>
              </div>
              <p className="text-xs text-charcoal/50">{p.category} · {p.era} · {formatPrice(p.price)}</p>
              <div className="mt-1.5 flex gap-2">
                <Link href={`/admin/products/${p.id}/edit`}
                  className="text-xs font-semibold text-cherry hover:underline">Edit</Link>
                <DeleteProductButton productId={p.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-5 hidden overflow-hidden rounded-xl border-2 border-warm-gray bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-warm-gray bg-cream text-left">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Product</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Category</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-charcoal/60">Status</th>
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
                    {p.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      : <div className="h-10 w-10 rounded-lg bg-cream" />}
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-charcoal/50">{p.era} · Size {p.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{p.category}</Badge></td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    p.status === "published" ? "bg-teal/10 text-teal-dark" : "bg-warm-gray/50 text-charcoal/50"
                  }`}>{p.status ?? "published"}</span>
                </td>
                <td className="px-4 py-3 font-bold text-cherry">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    p.stock === 0 ? "bg-cherry/10 text-cherry" : p.stock <= 2 ? "bg-gold/20 text-charcoal" : "bg-teal/10 text-teal-dark"
                  }`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/products/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <DeleteProductButton productId={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-charcoal/50">
            {q ? `No products matching "${q}"` : "No products yet."}
          </p>
        )}
      </div>
    </div>
  );
}
