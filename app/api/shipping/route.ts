import { NextResponse } from "next/server";
import { getDomesticRates } from "@/lib/auspost";
import { getAllSettings } from "@/lib/db";
import type { ShippingRate } from "@/lib/auspost";

export async function POST(request: Request) {
  const { to_postcode, items } = await request.json() as {
    to_postcode: string;
    items: { product_id: number; quantity: number; weight_grams?: number }[];
  };

  if (!to_postcode || !/^\d{4}$/.test(to_postcode)) {
    return NextResponse.json({ error: "Valid 4-digit Australian postcode required" }, { status: 400 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const settings = await getAllSettings();
  const username = settings.auspost_username ?? "";
  const password = settings.auspost_password ?? "";
  const account_number = settings.auspost_account_number ?? "";
  const from_postcode = settings.sender_postcode ?? "";
  const handling_fee = parseInt(settings.handling_fee_cents ?? "0", 10) || 0;

  if (!username || !password || !account_number || !from_postcode) {
    return NextResponse.json(
      { error: "Shipping not configured. Add your AusPost eParcel credentials in Settings." },
      { status: 503 }
    );
  }

  const total_weight = items.reduce(
    (sum, i) => sum + (i.weight_grams ?? 500) * i.quantity,
    0
  );

  const { rates, error } = await getDomesticRates({
    credentials: { username, password, account_number },
    from_postcode,
    to_postcode,
    weight_grams: total_weight,
  });

  if (error || rates.length === 0) {
    return NextResponse.json(
      { error: error ?? "Could not retrieve shipping rates. Check your postcode and try again." },
      { status: 502 }
    );
  }

  // Apply the per-order handling fee on top of the carrier rate
  const withHandling: ShippingRate[] = rates.map((r) => ({
    ...r,
    price: r.price + handling_fee,
  }));

  return NextResponse.json({ rates: withHandling, handling_fee });
}
