"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/lib/types";

interface Props {
  images: ProductImage[];
  fallbackUrl?: string;
  productName: string;
}

export default function ProductGallery({ images, fallbackUrl, productName }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const srcs = images.length > 0
    ? images.map(i => i.url)
    : fallbackUrl ? [fallbackUrl] : [];

  if (srcs.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-2xl bg-cream" />;
  }

  function prev() { setActive(a => (a - 1 + srcs.length) % srcs.length); }
  function next() { setActive(a => (a + 1) % srcs.length); }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="group relative cursor-zoom-in overflow-hidden rounded-2xl border-2 border-warm-gray bg-cream shadow-lg"
          onClick={() => setLightbox(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcs[active]}
            alt={productName}
            className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {srcs.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {srcs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {srcs.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === active ? "border-cherry" : "border-warm-gray hover:border-charcoal"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcs[active]}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {srcs.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {srcs.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
