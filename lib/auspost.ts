// Australia Post — Shipping & Tracking API (eParcel account pricing)
// POST https://digitalapi.auspost.com.au/shipping/v1/prices/items
// Auth: HTTP Basic (username:password) + account-number header
// Returns contract product pricing (GST inclusive) for the merchant's eParcel account.

const PRICES_URL = "https://digitalapi.auspost.com.au/shipping/v1/prices/items";

export interface ShippingRate {
  service_code: string; // AusPost product_id
  name: string; // displayable product_type
  price: number; // cents, GST inclusive
  eta: string;
}

export interface AuspostCredentials {
  username: string;
  password: string;
  account_number: string;
}

interface PriceEntry {
  product_id: string;
  product_type: string;
  calculated_price?: number;
  bundled_price?: number;
}

interface PricesResponse {
  items?: {
    prices?: PriceEntry[];
    errors?: { code: string; name: string; message: string }[];
    warnings?: { code: string; name: string; message: string }[];
  }[];
  errors?: { code: string; name: string; message: string }[];
}

function basicAuth(username: string, password: string): string {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

/**
 * Retrieve domestic parcel pricing for a single consolidated parcel.
 * Picks the cheapest standard Parcel Post and Express Post products from
 * the contract pricing returned by AusPost.
 */
export async function getDomesticRates(params: {
  credentials: AuspostCredentials;
  from_postcode: string;
  to_postcode: string;
  weight_grams: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}): Promise<{
  rates: ShippingRate[];
  error: string | null;
}> {
  const weight_kg = Math.max(0.1, params.weight_grams / 1000);

  const body = {
    from: { postcode: params.from_postcode },
    to: { postcode: params.to_postcode },
    items: [
      {
        length: params.length_cm ?? 30,
        width: params.width_cm ?? 22,
        height: params.height_cm ?? 8,
        weight: Number(weight_kg.toFixed(3)),
        item_reference: "cart-parcel",
      },
    ],
  };

  let json: PricesResponse;
  try {
    const res = await fetch(PRICES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "account-number": params.credentials.account_number,
        Authorization: basicAuth(params.credentials.username, params.credentials.password),
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    });
    json = await res.json();

    if (!res.ok) {
      const msg = json?.errors?.[0]?.message;
      return { rates: [], error: msg ?? `AusPost returned ${res.status}` };
    }
  } catch {
    return { rates: [], error: "Could not reach the Australia Post pricing service." };
  }

  const prices = json.items?.[0]?.prices ?? [];
  if (prices.length === 0) {
    const warn = json.items?.[0]?.warnings?.[0]?.message;
    const err = json.items?.[0]?.errors?.[0]?.message;
    return { rates: [], error: err ?? warn ?? "No postage products available for this route." };
  }

  // Group contract products into Standard (Parcel Post) and Express (Express Post),
  // picking the cheapest base service in each group.
  const toCents = (v: number) => Math.round(v * 100);

  function cheapestMatching(predicate: (type: string) => boolean): ShippingRate | null {
    const matches = prices
      .filter((p) => typeof p.calculated_price === "number" && predicate(p.product_type.toUpperCase()))
      .sort((a, b) => (a.calculated_price! - b.calculated_price!));
    const best = matches[0];
    if (!best) return null;
    return {
      service_code: best.product_id,
      name: best.product_type,
      price: toCents(best.calculated_price!),
      eta: "",
    };
  }

  // Base services first (exclude "+ SIGNATURE" / extras), fall back to any in the group.
  const standard =
    cheapestMatching((t) => t.includes("PARCEL POST") && !t.includes("+")) ??
    cheapestMatching((t) => t.includes("PARCEL POST"));

  const express =
    cheapestMatching((t) => t.includes("EXPRESS POST") && !t.includes("+")) ??
    cheapestMatching((t) => t.includes("EXPRESS POST"));

  const rates: ShippingRate[] = [];
  if (standard) rates.push({ ...standard, name: "Standard Parcel Post", eta: "2–6 business days" });
  if (express) rates.push({ ...express, name: "Express Parcel Post", eta: "1–3 business days" });

  if (rates.length === 0) {
    return { rates: [], error: "No Parcel Post or Express Post products found in your contract." };
  }

  return { rates, error: null };
}
