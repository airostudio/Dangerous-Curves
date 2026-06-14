"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Trash2, Minus, Plus, ShoppingBag, Loader2, CreditCard,
  Tag, Truck, CheckCircle2, ChevronRight,
} from "lucide-react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import type { ShippingRate } from "@/lib/auspost";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Discount code
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: number; code: string; amount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Shipping
  const [toPostcode, setToPostcode] = useState("");
  const [shippingRates, setShippingRates] = useState<ShippingRate[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const subtotal = totalPrice;
  const discountAmount = appliedDiscount?.amount ?? 0;
  const shippingAmount = selectedShipping?.price ?? 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingAmount;

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError("");
    const res = await fetch("/api/discount-codes/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode.trim(), order_total: subtotal }),
    });
    const data = await res.json();
    if (data.valid) {
      setAppliedDiscount({ id: data.discount_id, code: discountCode.trim().toUpperCase(), amount: data.discount_amount });
      setDiscountError("");
    } else {
      setAppliedDiscount(null);
      setDiscountError(data.error ?? "Invalid discount code");
    }
    setApplyingDiscount(false);
  }

  async function calculateShipping() {
    if (!/^\d{4}$/.test(toPostcode)) {
      setShippingError("Enter a valid 4-digit Australian postcode");
      return;
    }
    setLoadingShipping(true);
    setShippingError("");
    setShippingRates(null);
    setSelectedShipping(null);
    const res = await fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_postcode: toPostcode,
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
          weight_grams: product.weight_grams ?? 500,
        })),
      }),
    });
    const data = await res.json();
    if (res.ok && data.rates?.length > 0) {
      setShippingRates(data.rates);
      setSelectedShipping(data.rates[0]);
    } else {
      setShippingError(data.error ?? "Could not calculate shipping");
    }
    setLoadingShipping(false);
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutError("");
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
        shipping: selectedShipping
          ? { name: selectedShipping.name, price: selectedShipping.price }
          : null,
        discount_code: appliedDiscount?.code ?? null,
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

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
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
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Items */}
              <div className="space-y-4 lg:col-span-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4 rounded-xl border-2 border-warm-gray bg-white p-4 shadow-sm">
                    <img src={product.image_url} alt={product.name} className="h-28 w-24 rounded-lg object-cover" />
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
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="rounded border border-warm-gray p-1 transition hover:border-cherry hover:text-cherry">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} className="rounded border border-warm-gray p-1 transition hover:border-cherry hover:text-cherry">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-brand text-lg text-cherry">{formatPrice(product.price * quantity)}</p>
                        <button onClick={() => removeItem(product.id)} className="text-warm-gray transition hover:text-cherry">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-charcoal/40">
                  Clear Bag
                </Button>
              </div>

              {/* Summary sidebar */}
              <div className="space-y-4 lg:col-span-2">
                {/* Discount code */}
                <div className="rounded-xl border-2 border-warm-gray bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-cherry" />
                    <span className="text-sm font-bold uppercase tracking-wider">Promo Code</span>
                  </div>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between rounded-lg bg-teal/10 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-teal-dark">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{appliedDiscount.code}</span>
                        <span className="font-normal">— {formatPrice(appliedDiscount.amount)} off</span>
                      </div>
                      <button onClick={() => { setAppliedDiscount(null); setDiscountCode(""); }} className="text-xs text-charcoal/40 underline hover:text-cherry">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                        className="flex-1 font-mono text-sm uppercase"
                      />
                      <Button size="sm" variant="outline" onClick={applyDiscount} disabled={applyingDiscount || !discountCode}>
                        {applyingDiscount ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                  {discountError && <p className="mt-1.5 text-xs text-cherry">{discountError}</p>}
                </div>

                {/* Shipping calculator */}
                <div className="rounded-xl border-2 border-warm-gray bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-cherry" />
                    <span className="text-sm font-bold uppercase tracking-wider">Shipping</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Your postcode"
                      value={toPostcode}
                      onChange={(e) => setToPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onKeyDown={(e) => e.key === "Enter" && calculateShipping()}
                      maxLength={4}
                      className="flex-1 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={calculateShipping} disabled={loadingShipping || toPostcode.length !== 4}>
                      {loadingShipping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {shippingError && <p className="mt-1.5 text-xs text-cherry">{shippingError}</p>}
                  {shippingRates && shippingRates.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {shippingRates.map((rate) => (
                        <label
                          key={rate.service_code}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition ${
                            selectedShipping?.service_code === rate.service_code
                              ? "border-cherry bg-cherry/5"
                              : "border-warm-gray hover:border-charcoal/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input type="radio" name="shipping" checked={selectedShipping?.service_code === rate.service_code} onChange={() => setSelectedShipping(rate)} className="accent-cherry" />
                            <div>
                              <p className="text-sm font-semibold">{rate.name}</p>
                              <p className="text-xs text-charcoal/50">{rate.eta}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-cherry">{formatPrice(rate.price)}</p>
                        </label>
                      ))}
                    </div>
                  )}
                  {!shippingRates && !shippingError && (
                    <p className="mt-2 text-xs text-charcoal/40">AU postcode → live AusPost rates</p>
                  )}
                </div>

                {/* Total + checkout */}
                <div className="rounded-xl border-2 border-charcoal bg-white p-5 shadow-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between font-medium text-teal-dark">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>−{formatPrice(appliedDiscount.amount)}</span>
                      </div>
                    )}
                    {selectedShipping ? (
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">{selectedShipping.name}</span>
                        <span>{formatPrice(selectedShipping.price)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-charcoal/40">
                        <span>Shipping</span>
                        <span>Calculate above</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-warm-gray pt-2">
                      <p className="font-bold uppercase tracking-wider">Total</p>
                      <p className="font-brand text-3xl text-cherry">{formatPrice(total)}</p>
                    </div>
                  </div>
                  {checkoutError && <p className="mt-2 text-xs text-cherry">{checkoutError}</p>}
                  <Button size="lg" className="mt-4 w-full" onClick={handleCheckout} disabled={checkingOut}>
                    {checkingOut
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
                      : <><CreditCard className="mr-2 h-4 w-4" />Checkout with Stripe</>}
                  </Button>
                  <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                    <Link href="/store">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
