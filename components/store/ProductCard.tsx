"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group overflow-hidden rounded-xl border-2 border-warm-gray bg-white shadow-sm transition-all duration-300 hover:border-cherry hover:shadow-lg">
      <Link href={`/store/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.featured === 1 && <Badge variant="default">Hot</Badge>}
            <Badge variant="secondary">{product.era}</Badge>
          </div>
          {product.stock <= 1 && product.stock > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="gold">Last One</Badge>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60">
              <span className="font-rockabilly text-2xl text-white">Sold Out</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/store/${product.id}`}>
              <h3 className="truncate font-bold text-charcoal transition hover:text-cherry">
                {product.name}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-warm-gray">
              {product.category} &middot; Size {product.size}
            </p>
          </div>
          <p className="font-rockabilly text-lg text-cherry">{formatPrice(product.price)}</p>
        </div>
        <Button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="mt-3 w-full"
          size="sm"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.stock === 0 ? "Sold Out" : "Add to Bag"}
        </Button>
      </div>
    </div>
  );
}
