"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, Loader2, CreditCard } from "lucide-react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleCheckout() {
    setCheckingOut(true); setCheckoutError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image_url: product.image_url,
        })),
      }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setCheckoutError(data.error ?? "Checkout failed");
      setCheckingOut(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="border-b border-warm-gray bg-charcoal py-10 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cherry">Your selections</p>
            <h1 className="font-brand mt-1 text-4xl sm:text-5xl">Shopping Bag</h1>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-warm-gray" />
              <p className="font-brand mt-4 text-2xl">Your bag is empty</p>
              <p className="mt-2 text-sm text-charcoal/60">Time to fill it with something dangerous.</p>
              <Button className="mt-6" asChild>
                <Link href="/store">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-xl border-2 border-warm-gray bg-white p-4 shadow-sm"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-28 w-24 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link href={`/store/${product.id}`} className="font-bold transition hover:text-cherry">
                          {product.name}
                        </Link>
                        <p className="text-xs uppercase tracking-wider text-warm-gray">
                          {product.category} &middot; Size {product.size} &middot; {product.era}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="rounded border border-warm-gray p-1 transition hover:border-cherry hover:text-cherry"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="rounded border border-warm-gray p-1 transition hover:border-cherry hover:text-cherry"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-brand text-lg text-cherry">
                          {formatPrice(product.price * quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-warm-gray transition hover:text-cherry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border-2 border-charcoal bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-bold uppercase tracking-wider">Total</p>
                  <p className="font-brand text-3xl text-cherry">{formatPrice(totalPrice)}</p>
                </div>
                <p className="mt-1 text-xs text-charcoal/50">Shipping calculated at checkout</p>
                {checkoutError && (
                  <p className="mt-2 text-xs text-cherry">{checkoutError}</p>
                )}
                <Button
                  size="lg"
                  className="mt-4 w-full"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
                    : <><CreditCard className="mr-2 h-4 w-4" />Checkout with Stripe</>}
                </Button>
                <div className="mt-3 flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/store">Continue Shopping</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    Clear Bag
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
