"use client";

import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button onClick={handleAdd} disabled={product.stock === 0} size="lg" className="w-full">
      {added ? (
        <>
          <Check className="h-5 w-5" /> Added to Bag
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          {product.stock === 0 ? "Sold Out" : "Add to Bag"}
        </>
      )}
    </Button>
  );
}
