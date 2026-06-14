"use client";

/**
 * Mobile-first image pipeline: capture → edit → optimize → upload
 *
 * Flow: file/camera select → editor (crop + adjustments + filters) → WebP export → Supabase Storage
 */

import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  Camera, Upload, X, Check, ChevronLeft, ChevronRight,
  Sun, Contrast, Droplets, Thermometer, Layers, Zap, Circle,
  Scissors, Sliders, Sparkles, Loader2, Star, Trash2, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdjValues {
  brightness: number; // 50–150 (default 100)
  contrast: number;   // 50–150
  saturation: number; // 0–200
  warmth: number;     // -50 to 50
  highlights: number; // -100 to 100
  shadows: number;    // -100 to 100
  sharpness: number;  // 0–100
  vignette: number;   // 0–100
}

const DEFAULT_ADJ: AdjValues = {
  brightness: 100, contrast: 100, saturation: 100,
  warmth: 0, highlights: 0, shadows: 0, sharpness: 0, vignette: 0,
};

const FILTERS: { name: string; adj: Partial<AdjValues> }[] = [
  { name: "Original", adj: {} },
  { name: "Vintage",  adj: { brightness: 95, contrast: 108, saturation: 80, warmth: 25, highlights: -10, shadows: 15, vignette: 35 } },
  { name: "Cool",     adj: { brightness: 102, contrast: 105, saturation: 115, warmth: -20, highlights: 5, sharpness: 10 } },
  { name: "Warm",     adj: { brightness: 105, contrast: 98, saturation: 108, warmth: 30, shadows: 10, vignette: 15 } },
  { name: "B&W",      adj: { saturation: 0, contrast: 120, sharpness: 20, vignette: 25 } },
  { name: "Moody",    adj: { brightness: 88, contrast: 125, saturation: 85, warmth: -5, highlights: -20, shadows: -15, vignette: 50 } },
  { name: "Fresh",    adj: { brightness: 108, contrast: 92, saturation: 125, warmth: -15, highlights: 15 } },
  { name: "Drama",    adj: { brightness: 92, contrast: 135, saturation: 110, highlights: -25, shadows: -20, sharpness: 25, vignette: 55 } },
  { name: "Fade",     adj: { brightness: 110, contrast: 85, saturation: 80, warmth: 10, shadows: 20 } },
];

const ASPECT_PRESETS = [
  { label: "Free",  value: undefined },
  { label: "1 : 1", value: 1 },
  { label: "4 : 5", value: 4 / 5 },
  { label: "3 : 4", value: 3 / 4 },
  { label: "16 : 9",value: 16 / 9 },
];

// ─── Canvas utils ─────────────────────────────────────────────────────────────

function clamp(v: number) { return Math.max(0, Math.min(255, v)); }

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function getCroppedCanvas(img: HTMLImageElement, crop: Area): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = crop.width; c.height = crop.height;
  c.getContext("2d")!.drawImage(
    img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height
  );
  return c;
}

function applyPixelAdjustments(data: Uint8ClampedArray, adj: AdjValues) {
  const wr = adj.warmth * 1.5, wb = -adj.warmth * 1.5;
  const hlF = adj.highlights / 200, shF = adj.shadows / 200;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    r = clamp(r + wr); b = clamp(b + wb);
    const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    if (hlF !== 0) {
      const s = Math.max(0, luma - 0.5) * 2;
      const m = 1 + hlF * s;
      r = clamp(r * m); g = clamp(g * m); b = clamp(b * m);
    }
    if (shF !== 0) {
      const s = Math.max(0, 0.5 - luma) * 2;
      const m = 1 + shF * s;
      r = clamp(r * m); g = clamp(g * m); b = clamp(b * m);
    }
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
}

function applySharpness(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, amount: number) {
  if (amount <= 0) return;
  const w = canvas.width, h = canvas.height;
  const tmp = document.createElement("canvas");
  tmp.width = w; tmp.height = h;
  const tc = tmp.getContext("2d")!;
  tc.filter = `blur(${amount * 0.015}px)`;
  tc.drawImage(canvas, 0, 0);
  const orig = ctx.getImageData(0, 0, w, h);
  const blur = tc.getImageData(0, 0, w, h);
  const f = (amount / 100) * 2;
  for (let i = 0; i < orig.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      orig.data[i + c] = clamp(orig.data[i + c] + f * (orig.data[i + c] - blur.data[i + c]));
    }
  }
  ctx.putImageData(orig, 0, 0);
}

function applyVignette(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${(amount / 100) * 0.75})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

async function buildOutputCanvas(
  src: string,
  pixelCrop: Area | null,
  adj: AdjValues,
  rotation: number,
  maxDim = 1600
): Promise<HTMLCanvasElement> {
  const img = await loadImage(src);

  // Step 1: rotate + crop onto a canvas
  let base: HTMLCanvasElement;
  if (rotation !== 0) {
    const rot = document.createElement("canvas");
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    rot.width = Math.round(img.height * sin + img.width * cos);
    rot.height = Math.round(img.height * cos + img.width * sin);
    const rc = rot.getContext("2d")!;
    rc.translate(rot.width / 2, rot.height / 2);
    rc.rotate(rad);
    rc.drawImage(img, -img.width / 2, -img.height / 2);
    base = pixelCrop ? getCroppedCanvas({ ...img, width: rot.width, height: rot.height } as HTMLImageElement, pixelCrop) : rot;
    // For rotation with crop, draw the rotated canvas through the crop
    if (pixelCrop) {
      const c2 = document.createElement("canvas");
      c2.width = pixelCrop.width; c2.height = pixelCrop.height;
      c2.getContext("2d")!.drawImage(rot, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      base = c2;
    }
  } else {
    base = pixelCrop ? getCroppedCanvas(img, pixelCrop) : (() => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      return c;
    })();
  }

  // Step 2: scale to maxDim
  let w = base.width, h = base.height;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale); h = Math.round(h * scale);
  }
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const ctx = out.getContext("2d")!;

  // Step 3: CSS filter pass (brightness/contrast/saturation — GPU fast)
  ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
  ctx.drawImage(base, 0, 0, w, h);
  ctx.filter = "none";

  // Step 4: pixel adjustments (warmth, highlights, shadows)
  const id = ctx.getImageData(0, 0, w, h);
  applyPixelAdjustments(id.data, adj);
  ctx.putImageData(id, 0, 0);

  // Step 5: sharpness
  applySharpness(out, ctx, adj.sharpness);

  // Step 6: vignette
  applyVignette(ctx, w, h, adj.vignette);

  return out;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/webp", quality = 0.88): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), type, quality)
  );
}

// ─── Upload helpers ────────────────────────────────────────────────────────────

async function uploadImage(
  blob: Blob,
  productId: number,
  isPrimary: boolean,
  dimensions: { width: number; height: number }
): Promise<void> {
  // 1. Get signed upload URL from our server
  const urlRes = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "photo.webp" }),
  });
  if (!urlRes.ok) throw new Error("Failed to get upload URL");
  const { signedUrl, path, publicUrl } = await urlRes.json();

  // 2. PUT directly to Supabase Storage (avoids Vercel's 4.5 MB body limit)
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/webp", "x-upsert": "true" },
    body: blob,
  });
  if (!putRes.ok) throw new Error("Storage upload failed");

  // 3. Save metadata
  const saveRes = await fetch("/api/admin/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId, path, url: publicUrl,
      is_primary: isPrimary,
      width: dimensions.width, height: dimensions.height,
    }),
  });
  if (!saveRes.ok) throw new Error("Failed to save image metadata");
}

// ─── Preview canvas component ─────────────────────────────────────────────────

function AdjPreview({ src, adj }: { src: string; adj: AdjValues }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const img = await loadImage(src);
        if (cancelled) return;
        const maxPrev = 480;
        const scale = Math.min(1, maxPrev / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = canvasRef.current!;
        c.width = w; c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.filter = "none";
        const id = ctx.getImageData(0, 0, w, h);
        applyPixelAdjustments(id.data, adj);
        ctx.putImageData(id, 0, 0);
        applySharpness(c, ctx, adj.sharpness);
        applyVignette(ctx, w, h, adj.vignette);
      } catch (_) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [src, adj]);

  return <canvas ref={canvasRef} className="max-h-[50vh] w-full rounded-lg object-contain" />;
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function AdjSlider({
  label, icon: Icon, value, min, max, step = 1, onChange,
}: {
  label: string; icon: React.ElementType; value: number;
  min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/70">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className="text-xs text-charcoal/50">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-warm-gray accent-cherry"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  productId: number;
  existingCount: number;
  onUploaded: () => void;
}

type Step = "pick" | "crop" | "adjust" | "upload";
type AdjTab = "adjust" | "filter" | "extra";

export default function ImagePipeline({ productId, existingCount, onUploaded }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [adjTab, setAdjTab] = useState<AdjTab>("adjust");

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Adjust state
  const [adj, setAdj] = useState<AdjValues>(DEFAULT_ADJ);
  const [activeFilter, setActiveFilter] = useState(0);

  // Extra state
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgRemoved, setBgRemoved] = useState<string | null>(null);
  const [watermark, setWatermark] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("pick");
    setRawSrc(null);
    setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setAspect(1);
    setCroppedAreaPixels(null);
    setAdj(DEFAULT_ADJ); setActiveFilter(0);
    setBgRemoved(null); setBgRemoving(false); setWatermark(false);
    setUploadError("");
  }, []);

  const open = () => { reset(); setIsOpen(true); };
  const close = () => { setIsOpen(false); reset(); };

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRawSrc(url);
    setStep("crop");
  }

  function applyFilter(idx: number) {
    setActiveFilter(idx);
    setAdj({ ...DEFAULT_ADJ, ...FILTERS[idx].adj });
  }

  function setAdjField<K extends keyof AdjValues>(k: K, v: AdjValues[K]) {
    setAdj(a => ({ ...a, [k]: v }));
    setActiveFilter(0); // mark as custom
  }

  async function removeBg() {
    if (!rawSrc) return;
    setBgRemoving(true);
    try {
      const srcToUse = bgRemoved ?? rawSrc;
      const img = await loadImage(srcToUse);
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await canvasToBlob(c, "image/png", 1);
      const { removeBackground } = await import("@imgly/background-removal");
      const result = await removeBackground(blob, { output: { format: "image/webp", quality: 0.9 } });
      setBgRemoved(URL.createObjectURL(result));
    } catch (err) {
      console.error("BG removal error:", err);
    } finally {
      setBgRemoving(false);
    }
  }

  async function handleConfirm() {
    setUploading(true); setUploadError("");
    try {
      const finalSrc = bgRemoved ?? rawSrc!;
      const canvas = await buildOutputCanvas(finalSrc, croppedAreaPixels, adj, rotation);

      if (watermark) {
        const ctx = canvas.getContext("2d")!;
        const { width: w, height: h } = canvas;
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.max(12, Math.round(w * 0.022))}px Georgia, serif`;
        ctx.textAlign = "right"; ctx.textBaseline = "bottom";
        ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;
        ctx.fillText("DANGEROUS CURVES", w - 12, h - 12);
        ctx.restore();
      }

      const blob = await canvasToBlob(canvas);
      const isPrimary = existingCount === 0;
      await uploadImage(blob, productId, isPrimary, { width: canvas.width, height: canvas.height });
      onUploaded();
      close();
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={open}
        className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-warm-gray bg-cream/50 text-sm font-medium text-charcoal/50 transition hover:border-cherry hover:text-cherry sm:h-36"
      >
        <Camera className="h-8 w-8" />
        <span>Add Photo</span>
        <span className="text-xs">Camera · Library · Drag & drop</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-charcoal text-white" style={{ touchAction: "none" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        {step !== "pick" ? (
          <button onClick={() => setStep(step === "adjust" ? "crop" : step === "upload" ? "adjust" : "pick")}
            className="flex items-center gap-1 text-sm text-warm-gray">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        ) : <span />}
        <span className="text-sm font-semibold">
          {step === "pick" ? "Add Photo" : step === "crop" ? "Crop & Rotate" : step === "adjust" ? "Edit" : "Uploading…"}
        </span>
        <button onClick={close} className="text-warm-gray hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      {/* Pick */}
      {step === "pick" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickFile} />
          <button
            onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); } }}
            className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border-2 border-white/20 bg-white/5 py-10 transition hover:border-cherry hover:bg-white/10"
          >
            <Camera className="h-12 w-12 text-cherry" />
            <span className="font-semibold">Take Photo</span>
            <span className="text-xs text-warm-gray">Use your camera</span>
          </button>
          <button
            onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); } }}
            className="flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border-2 border-white/20 bg-white/5 py-10 transition hover:border-cherry hover:bg-white/10"
          >
            <Upload className="h-12 w-12 text-gold" />
            <span className="font-semibold">Choose Photo</span>
            <span className="text-xs text-warm-gray">From your library</span>
          </button>
        </div>
      )}

      {/* Crop */}
      {step === "crop" && rawSrc && (
        <div className="flex flex-1 flex-col">
          <div className="relative flex-1 bg-black" style={{ minHeight: 0 }}>
            <Cropper
              image={rawSrc}
              crop={crop} zoom={zoom} rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, px) => setCroppedAreaPixels(px)}
            />
          </div>
          <div className="shrink-0 space-y-3 bg-charcoal-light px-4 py-4">
            {/* Aspect presets */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ASPECT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setAspect(p.value)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${aspect === p.value ? "bg-cherry text-white" : "bg-white/10 text-warm-gray hover:bg-white/20"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Rotation */}
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-warm-gray" />
              <input
                type="range" min={-180} max={180} value={rotation}
                onChange={e => setRotation(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-cherry"
              />
              <span className="w-10 text-right text-xs text-warm-gray">{rotation}°</span>
            </div>
            <Button onClick={() => setStep("adjust")} className="w-full">
              Next: Edit <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Adjust */}
      {step === "adjust" && rawSrc && (
        <div className="flex flex-1 flex-col" style={{ minHeight: 0 }}>
          {/* Preview */}
          <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-2" style={{ minHeight: 0 }}>
            <AdjPreview src={bgRemoved ?? rawSrc} adj={adj} />
          </div>

          {/* Tabs */}
          <div className="shrink-0 bg-charcoal-light">
            <div className="flex border-b border-white/10">
              {(["adjust", "filter", "extra"] as AdjTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAdjTab(t)}
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${adjTab === t ? "border-b-2 border-cherry text-white" : "text-warm-gray"}`}
                >
                  {t === "adjust" ? <><Sliders className="inline h-3.5 w-3.5 mr-1" />Adjust</> :
                   t === "filter" ? <><Sparkles className="inline h-3.5 w-3.5 mr-1" />Filters</> :
                   <><Layers className="inline h-3.5 w-3.5 mr-1" />Extras</>}
                </button>
              ))}
            </div>

            <div className="max-h-56 overflow-y-auto p-4">
              {adjTab === "adjust" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdjSlider label="Brightness" icon={Sun} value={adj.brightness} min={50} max={150} onChange={v => setAdjField("brightness", v)} />
                  <AdjSlider label="Contrast" icon={Contrast} value={adj.contrast} min={50} max={150} onChange={v => setAdjField("contrast", v)} />
                  <AdjSlider label="Saturation" icon={Droplets} value={adj.saturation} min={0} max={200} onChange={v => setAdjField("saturation", v)} />
                  <AdjSlider label="Warmth" icon={Thermometer} value={adj.warmth} min={-50} max={50} onChange={v => setAdjField("warmth", v)} />
                  <AdjSlider label="Highlights" icon={Sun} value={adj.highlights} min={-100} max={100} onChange={v => setAdjField("highlights", v)} />
                  <AdjSlider label="Shadows" icon={Circle} value={adj.shadows} min={-100} max={100} onChange={v => setAdjField("shadows", v)} />
                  <AdjSlider label="Sharpness" icon={Scissors} value={adj.sharpness} min={0} max={100} onChange={v => setAdjField("sharpness", v)} />
                  <AdjSlider label="Vignette" icon={Zap} value={adj.vignette} min={0} max={100} onChange={v => setAdjField("vignette", v)} />
                  <button onClick={() => { setAdj(DEFAULT_ADJ); setActiveFilter(0); }}
                    className="col-span-full text-xs text-warm-gray/60 underline underline-offset-2 hover:text-warm-gray">
                    Reset adjustments
                  </button>
                </div>
              )}
              {adjTab === "filter" && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {FILTERS.map((f, i) => (
                    <button
                      key={f.name}
                      onClick={() => applyFilter(i)}
                      className={`rounded-lg px-2 py-3 text-center text-xs font-semibold transition ${activeFilter === i ? "bg-cherry text-white" : "bg-white/10 text-warm-gray hover:bg-white/20"}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
              {adjTab === "extra" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">Remove Background</p>
                      <p className="text-xs text-warm-gray">AI-powered, works best on flat lays</p>
                    </div>
                    <Button size="sm" variant="outline"
                      onClick={removeBg} disabled={bgRemoving}
                      className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                      {bgRemoving ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Working…</> : "Remove BG"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">Watermark</p>
                      <p className="text-xs text-warm-gray">Add "DANGEROUS CURVES" text</p>
                    </div>
                    <button
                      onClick={() => setWatermark(w => !w)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${watermark ? "bg-cherry" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${watermark ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mx-4 mb-2 rounded-lg bg-cherry/20 px-3 py-2 text-xs text-cherry-light">{uploadError}</div>
            )}
            <div className="flex gap-2 px-4 pb-4 pt-2">
              <Button variant="outline" onClick={() => setStep("crop")}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleConfirm} disabled={uploading} className="flex-1">
                {uploading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
                  : <><Check className="mr-2 h-4 w-4" />Add to Product</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
