"use client";

import { useState, useRef } from "react";
import { Star, Trash2, GripVertical, Loader2 } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import ImagePipeline from "./ImagePipeline";

interface Props {
  productId: number;
  images: ProductImage[];
  onRefresh: () => void;
}

export default function ProductImageGallery({ productId, images, onRefresh }: Props) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [promoting, setPromoting] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  async function deleteImage(id: number) {
    setDeleting(id);
    await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    setDeleting(null);
    onRefresh();
  }

  async function setAsPrimary(id: number) {
    setPromoting(id);
    await fetch(`/api/admin/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    setPromoting(null);
    onRefresh();
  }

  // Simple drag-to-reorder
  const dragId = useRef<number | null>(null);

  async function handleDrop(targetId: number) {
    if (dragId.current === null || dragId.current === targetId) return;
    const ids = images.map(i => i.id);
    const fromIdx = ids.indexOf(dragId.current);
    const toIdx = ids.indexOf(targetId);
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragId.current);
    await fetch("/api/admin/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, ordered_ids: reordered }),
    });
    onRefresh();
    setDragOver(null);
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => { dragId.current = img.id; }}
              onDragOver={e => { e.preventDefault(); setDragOver(img.id); }}
              onDrop={() => handleDrop(img.id)}
              onDragEnd={() => setDragOver(null)}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 cursor-grab transition ${
                img.is_primary ? "border-cherry" : "border-warm-gray"
              } ${dragOver === img.id ? "border-gold scale-105" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />

              {img.is_primary && (
                <div className="absolute left-1 top-1 rounded bg-cherry px-1 py-0.5">
                  <Star className="h-3 w-3 fill-white text-white" />
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                {!img.is_primary && (
                  <button
                    onClick={() => setAsPrimary(img.id)}
                    disabled={promoting === img.id}
                    className="flex items-center gap-1 rounded bg-gold/90 px-2 py-1 text-[10px] font-bold text-charcoal hover:bg-gold"
                  >
                    {promoting === img.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Star className="h-3 w-3" />}
                    Primary
                  </button>
                )}
                <button
                  onClick={() => deleteImage(img.id)}
                  disabled={deleting === img.id}
                  className="flex items-center gap-1 rounded bg-cherry/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-cherry"
                >
                  {deleting === img.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />}
                  Delete
                </button>
              </div>

              <div className="absolute bottom-1 right-1 opacity-0 transition group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white/70" />
              </div>
            </div>
          ))}
        </div>
      )}

      <ImagePipeline
        productId={productId}
        existingCount={images.length}
        onUploaded={onRefresh}
      />

      {images.length > 0 && (
        <p className="text-xs text-charcoal/40">
          Drag to reorder · Star = primary storefront image
        </p>
      )}
    </div>
  );
}

