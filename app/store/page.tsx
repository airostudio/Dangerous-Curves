import { Suspense } from "react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getProductsByFilter } from "@/lib/db";
import StoreFilters from "./StoreFilters";

export const dynamic = "force-dynamic";

const CATEGORIES = ["All", "Outerwear", "Dresses", "Tops", "Bottoms", "Denim", "Shoes", "Accessories"];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || "All";
  const search = params.q || "";
  const products = await getProductsByFilter(category, search);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="border-b border-warm-gray bg-charcoal py-10 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cherry">Browse the rack</p>
            <h1 className="font-rockabilly mt-1 text-4xl sm:text-5xl">
              {category !== "All" ? category : "Shop All"}
            </h1>
            {search && (
              <p className="mt-2 text-warm-gray">
                Results for &ldquo;<span className="text-white">{search}</span>&rdquo;
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <StoreFilters categories={CATEGORIES} activeCategory={category} currentSearch={search} />
          </Suspense>

          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-rockabilly text-2xl text-charcoal">No pieces found</p>
              <p className="mt-2 text-sm text-warm-gray">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
