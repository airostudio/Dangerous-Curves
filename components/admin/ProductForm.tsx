"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";

const CATEGORIES = ["Outerwear", "Dresses", "Tops", "Bottoms", "Denim", "Shoes", "Accessories"];
const ERAS = ["50s", "60s", "70s", "80s", "90s", "Y2K"];

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      price: Math.round(parseFloat(form.get("price") as string) * 100),
      category: form.get("category"),
      size: form.get("size"),
      era: form.get("era"),
      image_url: form.get("image_url"),
      stock: parseInt(form.get("stock") as string),
      featured: form.get("featured") === "on" ? 1 : 0,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl border-2 border-warm-gray bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg bg-cherry/10 px-3 py-2 text-sm text-cherry">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Name</label>
          <Input name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Category</label>
          <select
            name="category"
            defaultValue={product?.category || ""}
            required
            className="flex h-10 w-full rounded-lg border-2 border-warm-gray bg-white px-3 py-2 text-sm focus:border-cherry focus:outline-none"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description}
          rows={3}
          className="flex w-full rounded-lg border-2 border-warm-gray bg-white px-3 py-2 text-sm focus:border-cherry focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Price ($)</label>
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? (product.price / 100).toFixed(2) : ""}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Size</label>
          <Input name="size" defaultValue={product?.size} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Era</label>
          <select
            name="era"
            defaultValue={product?.era || ""}
            required
            className="flex h-10 w-full rounded-lg border-2 border-warm-gray bg-white px-3 py-2 text-sm focus:border-cherry focus:outline-none"
          >
            <option value="">Select...</option>
            {ERAS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Stock</label>
          <Input name="stock" type="number" min="0" defaultValue={product?.stock ?? 1} required />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Image URL</label>
        <Input name="image_url" type="url" defaultValue={product?.image_url} placeholder="https://..." />
      </div>

      <div className="flex items-center gap-2">
        <input
          name="featured"
          type="checkbox"
          id="featured"
          defaultChecked={product?.featured === 1}
          className="h-4 w-4 accent-cherry"
        />
        <label htmlFor="featured" className="text-sm font-bold">Featured product</label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
