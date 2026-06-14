import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Truck, RotateCcw } from "lucide-react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Badge } from "@/components/ui/badge";
import { getProductById, getProductsByCategory } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(parseInt(id));
  if (!product) notFound();

  const related = await getProductsByCategory(product.category, product.id);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-charcoal/60 transition hover:text-cherry"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border-2 border-warm-gray bg-cream shadow-lg">
              <img src={product.image_url} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{product.era}</Badge>
                <Badge variant="outline">{product.category}</Badge>
                {product.featured === 1 && <Badge variant="default">Featured</Badge>}
              </div>

              <h1 className="font-rockabilly text-4xl sm:text-5xl">{product.name}</h1>
              <p className="font-rockabilly text-4xl text-cherry">{formatPrice(product.price)}</p>
              <p className="text-base leading-relaxed text-charcoal-light/80">{product.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="rounded-lg border border-warm-gray bg-cream px-4 py-2">
                  <span className="text-charcoal/50">Size:</span> <span className="font-bold">{product.size}</span>
                </div>
                <div className="rounded-lg border border-warm-gray bg-cream px-4 py-2">
                  <span className="text-charcoal/50">Era:</span> <span className="font-bold">{product.era}</span>
                </div>
                <div className="rounded-lg border border-warm-gray bg-cream px-4 py-2">
                  <span className="text-charcoal/50">Stock:</span>{" "}
                  <span className="font-bold">{product.stock > 0 ? `${product.stock} left` : "Sold out"}</span>
                </div>
              </div>

              <AddToCartButton product={product} />

              <div className="grid grid-cols-3 gap-3 border-t border-warm-gray pt-6">
                {[
                  { icon: Truck, label: "Free shipping over $100" },
                  { icon: Shield, label: "Authenticity guaranteed" },
                  { icon: RotateCcw, label: "14-day returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="h-5 w-5 text-cherry" />
                    <p className="text-xs text-charcoal/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-rockabilly text-2xl">You might also dig</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                {related.map((p) => (
                  <Link key={p.id} href={`/store/${p.id}`} className="group">
                    <div className="overflow-hidden rounded-xl border-2 border-warm-gray transition hover:border-cherry">
                      <img src={p.image_url} alt={p.name} className="aspect-[3/4] w-full object-cover transition group-hover:scale-105" />
                    </div>
                    <p className="mt-2 font-bold transition group-hover:text-cherry">{p.name}</p>
                    <p className="text-sm text-cherry">{formatPrice(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
