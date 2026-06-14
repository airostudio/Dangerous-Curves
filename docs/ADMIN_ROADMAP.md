# Dangerous Curves — Admin & Store Roadmap

Goal: evolve the current basic admin into a world-class store admin with
WooCommerce-grade ease, Elementor-grade UX polish, and an Instagram-grade,
phone-first image pipeline (capture on phone → edit → optimize → store).

This document is the plan. No phase is started until you sequence it.
Effort sizes are rough: **S** ≈ ~1 day, **M** ≈ 2–4 days, **L** ≈ ~1 week,
**XL** ≈ multi-week. They assume one focused contributor.

---

## Current state (baseline)

- **Stack:** Next.js 16, React 19, Tailwind v4, Supabase (Postgres), Vercel.
- **Admin:** custom cookie session auth (`admin` user in `admin_users`),
  product list + flat add/edit form, orders list, dashboard stats.
- **Images:** a single `image_url` **text field** — paste a link. No upload,
  no camera, no processing, no storage. Sample products use Unsplash URLs.
- **Data:** `products` (single image), `orders`, `order_items`, `admin_users`,
  `sessions`. No image table, no variants, no product status/drafts.

**Verdict:** functional, not world-class. The biggest missing capability is
the entire image pipeline, which everything visual depends on.

---

## Prerequisites / cross-cutting (do once, early)

- **P0 — Secure the basics (S):** change the default `admin/admin123`
  password; add basic rate limiting on `/api/auth/login`; confirm Storage
  bucket policies are locked down. *(Should land before/with Phase 1.)*
- **Local Next.js docs:** per `AGENTS.md`, this is a modified Next.js — every
  implementation phase must read `node_modules/next/dist/docs/` for the
  relevant APIs before coding (App Router, Route Handlers, Image, caching).
- **Image storage decision (locked default):** **Supabase Storage**, bucket
  `product-images`, public read. Writes happen via **server-minted signed
  upload URLs** (guarded by our admin session) so the phone uploads the
  processed blob *directly* to Storage — this sidesteps Vercel's ~4.5 MB
  serverless body limit.

---

## Phase 1 — Mobile photo pipeline (the core ask) · **L–XL**

A phone-first capture→edit→optimize→store flow, with a **full** editor.

### 1a. Storage + data model (M)
- Create Supabase Storage bucket `product-images` (+ policies).
- New table `product_images`:
  `id, product_id (fk), path, url, position, is_primary, width, height, created_at`.
- Migration + db helpers (`addProductImage`, `listProductImages`,
  `reorderImages`, `setPrimary`, `deleteImage`).
- Backfill: keep `products.image_url` working as the primary-image mirror so
  the storefront keeps rendering during the transition.

### 1b. Capture (S–M)
- Phone: `<input type="file" accept="image/*" capture="environment" multiple>`
  for native camera/roll; desktop: drag-drop + file picker.
- Multi-select; queue of pending images with thumbnails.
- Optional later: in-app live camera via `getUserMedia` (nicer, more work).

### 1c. Full editor (L) — client-side, canvas-based
- **Crop / rotate / straighten** with aspect presets (1:1, 4:5, 3:4, free).
  Likely `react-easy-crop` or a custom canvas cropper.
- **Adjustments:** exposure/brightness, contrast, saturation, temperature
  (warmth), highlights/shadows, sharpness, vignette.
- **Preset filters:** a set of named looks (built on the adjustment stack).
- **Background cleanup:** in-browser removal via a WASM model
  (e.g. `@imgly/background-removal`). ⚠️ Heavy (~several MB model download,
  slower on low-end phones) — load on demand, show progress, make optional.
- **Watermark:** optional brand-logo/text overlay rendered on the canvas.
- Non-destructive UI (sliders/preview); export bakes edits into the output.

### 1d. Optimize + upload (M)
- Export canvas → **WebP** (JPEG fallback), capped at a max dimension
  (e.g. 1600px), quality-tuned.
- Generate a few sizes (thumb / medium / full) — client-side now; can later
  switch to Supabase on-the-fly image transforms.
- Upload each blob to Storage via signed URL; persist rows in `product_images`.
- Wire results into the product editor's media gallery (reorder, set primary,
  delete).

**Dependencies:** feeds Phase 2 (media gallery) and Phase 4 (storefront
galleries).

---

## Phase 2 — WooCommerce-style product editor · **L**

Restructure the flat form into a sectioned, forgiving editor.

- **Sections:** Media gallery (from Phase 1) · Pricing & inventory ·
  Organization (category / era / tags) · Status · (optional) SEO.
- **Variants (M–L):** sizes/colours with per-variant stock + optional price.
  New `product_variants` table; storefront + cart updates to match.
- **Drafts/status (S):** add `status` (draft/published) to `products`;
  storefront shows published only.
- **Quality-of-life:** inline validation, autosave or dirty-state guard,
  success/error toasts, duplicate-product action.

**Dependencies:** variants ripple into cart (Phase 4) and inventory.

---

## Phase 3 — Admin UX polish ("Elementor feel") · **M–L**

- **Responsive app shell:** sidebar that collapses to a hamburger/bottom-nav
  on mobile; safe-area aware; large tap targets.
- **Data tables:** search, sort, pagination, bulk actions (delete, feature,
  publish) for products and orders.
- **Component kit:** toasts (e.g. `sonner`), dialogs/confirms, skeleton
  loaders, empty states, consistent buttons/inputs.
- **Dashboard:** real widgets (sales over time, low stock, recent orders),
  tuned for phone.

---

## Phase 4 — Storefront + checkout completeness · **L–XL**

- **Galleries:** product pages use the multi-image gallery + zoom.
- **Payments (L):** Stripe Checkout; webhook → create order, decrement stock;
  order-confirmation emails (e.g. Resend).
- **Inventory integrity:** prevent overselling; reflect variant stock.
- **Optional:** customer accounts, order tracking, discount codes.

---

## Suggested sequence (my recommendation)

`P0 → 1a → 1b → 1d → 1c → 2 → 3 → 4`

Rationale: stand up storage + upload + optimization (1a/1b/1d) so images flow
end-to-end **before** investing in the heavy full editor (1c). Then the
product editor (2) and UX polish (3) build on real media, and checkout (4)
lands last since it depends on variants/inventory from Phase 2.

You can reorder freely — e.g. do Phase 3 polish earlier if the priority is
"looks world-class in a demo" over "image features first."

---

## Open questions to confirm before building each phase

1. **Background removal** in Phase 1 — worth the heavy in-browser model, or
   defer to a later sub-phase / server-side service?
2. **Variants** (Phase 2) — do you actually sell multiple sizes/colours per
   listing, or is each vintage piece one-of-one (current assumption)?
3. **Payments** (Phase 4) — Stripe? Region/currency? Live now or later?
4. **Image transforms** — stay client-side, or adopt Supabase's on-the-fly
   transform (plan-dependent) for thumbnails?
