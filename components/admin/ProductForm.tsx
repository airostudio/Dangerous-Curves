"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, ProductImage } from "@/lib/types";
import ProductImageGallery from "./ProductImageGallery";
import { Save, Eye, EyeOff, Loader2 } from "lucide-react";

const CATEGORIES = ["Outerwear", "Dresses", "Tops", "Bottoms", "Denim", "Shoes", "Accessories"];
const ERAS = ["40s", "50s", "60s", "70s", "80s", "90s", "Y2K"];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-warm-gray bg-white shadow-sm">
      <div className="border-b border-warm-gray px-5 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal/60">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal/60">{children}</label>;
}

function Select({ name, value, onChange, children, required }: {
  name: string; value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <select
      name={name} value={value} onChange={e => onChange(e.target.value)} required={required}
      className="flex h-10 w-full rounded-lg border-2 border-warm-gray bg-white px-3 py-2 text-sm focus:border-cherry focus:outline-none"
    >
      {children}
    </select>
  );
}

interface Props {
  product?: Product;
}

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const isNew = !product;

  // Core fields
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? (product.price / 100).toFixed(2) : "");
  const [stock, setStock] = useState(String(product?.stock ?? 1));
  const [weightGrams, setWeightGrams] = useState(String(product?.weight_grams ?? 500));
  const [category, setCategory] = useState(product?.category ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [era, setEra] = useState(product?.era ?? "");
  const [featured, setFeatured] = useState(product?.featured === 1);
  const [status, setStatus] = useState<"published" | "draft">(
    (product?.status as "published" | "draft") ?? "published"
  );

  // Images (for existing products loaded from DB; for new products managed after save)
  const [productId, setProductId] = useState<number | null>(product?.id ?? null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const [saving, setSaving] = useState(false);

  async function loadImages(id: number) {
    setLoadingImages(true);
    const res = await fetch(`/api/admin/images?product_id=${id}`);
    if (res.ok) {
      const { images: imgs } = await res.json();
      setImages(imgs);
    }
    setLoadingImages(false);
  }

  useEffect(() => {
    if (productId) loadImages(productId);
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      name, description,
      price: Math.round(parseFloat(price) * 100),
      category, size, era,
      stock: parseInt(stock),
      weight_grams: parseInt(weightGrams) || 500,
      featured: featured ? 1 : 0,
      status,
      image_url: images.find(i => i.is_primary)?.url ?? product?.image_url ?? "",
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      if (isNew && data.id) {
        setProductId(data.id);
        toast.success("Product created! You can now add photos.");
      } else {
        toast.success("Product saved.");
        router.push("/admin/products");
        router.refresh();
      }
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Something went wrong");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Top bar — status + save */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatus(s => s === "published" ? "draft" : "published")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
              status === "published"
                ? "bg-teal/15 text-teal-dark"
                : "bg-warm-gray/50 text-charcoal/60"
            }`}
          >
            {status === "published"
              ? <><Eye className="h-3.5 w-3.5" />Published</>
              : <><EyeOff className="h-3.5 w-3.5" />Draft</>}
          </button>
          <span className="text-xs text-charcoal/40">
            {status === "draft" ? "Hidden from store" : "Visible in store"}
          </span>
        </div>
        <Button type="submit" disabled={saving}>
          {saving
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            : <><Save className="mr-2 h-4 w-4" />{isNew ? "Save & Add Photos" : "Save Changes"}</>}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Photos */}
          <SectionCard title="Photos">
            {productId ? (
              loadingImages ? (
                <div className="flex items-center gap-2 text-sm text-charcoal/50">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading photos…
                </div>
              ) : (
                <ProductImageGallery
                  productId={productId}
                  images={images}
                  onRefresh={() => loadImages(productId)}
                />
              )
            ) : (
              <div className="rounded-lg border-2 border-dashed border-warm-gray bg-cream/50 p-6 text-center">
                <p className="text-sm text-charcoal/50">Save the product details first,<br />then add photos.</p>
              </div>
            )}
          </SectionCard>

          {/* Details */}
          <SectionCard title="Details">
            <div className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Cherry Bomb Leather Jacket" required
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Describe the piece — its story, condition, details that make it special."
                  className="flex w-full rounded-lg border-2 border-warm-gray bg-white px-3 py-2 text-sm focus:border-cherry focus:outline-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* Pricing & inventory */}
          <SectionCard title="Pricing & Inventory">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0.00" required
                />
              </div>
              <div>
                <Label>Stock Qty</Label>
                <Input
                  type="number" min="0"
                  value={stock} onChange={e => setStock(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Weight (grams)</Label>
                <Input
                  type="number" min="50" step="50"
                  value={weightGrams} onChange={e => setWeightGrams(e.target.value)}
                  placeholder="500"
                />
                <p className="mt-1 text-xs text-charcoal/40">For AusPost shipping rates</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Organisation */}
          <SectionCard title="Organisation">
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select name="category" value={category} onChange={setCategory} required>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label>Era</Label>
                <Select name="era" value={era} onChange={setEra} required>
                  <option value="">Select…</option>
                  {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
                </Select>
              </div>
              <div>
                <Label>Size / Measurement</Label>
                <Input
                  value={size} onChange={e => setSize(e.target.value)}
                  placeholder="e.g. M, 10, 32W, One Size" required
                />
              </div>
            </div>
          </SectionCard>

          {/* Featured */}
          <SectionCard title="Visibility">
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Featured Product</p>
                <p className="text-xs text-charcoal/50">Show on the homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(f => !f)}
                className={`relative h-6 w-11 rounded-full transition-colors ${featured ? "bg-cherry" : "bg-warm-gray"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${featured ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>
          </SectionCard>
        </div>
      </div>
    </form>
  );
}
