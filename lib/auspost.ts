const AUSPOST_URL =
  "https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json";

export interface ShippingRate {
  service_code: string;
  name: string;
  price: number; // cents
  eta: string;
}

export async function getDomesticRates(params: {
  api_key: string;
  from_postcode: string;
  to_postcode: string;
  weight_grams: number;
}): Promise<{ standard: ShippingRate | null; express: ShippingRate | null }> {
  const weight_kg = Math.max(0.1, params.weight_grams / 1000).toFixed(3);
  const base = new URLSearchParams({
    from_postcode: params.from_postcode,
    to_postcode: params.to_postcode,
    length: "30",
    width: "20",
    height: "5",
    weight: weight_kg,
  });

  async function fetchRate(
    service_code: string,
    name: string
  ): Promise<ShippingRate | null> {
    try {
      const res = await fetch(`${AUSPOST_URL}?${base}&service_code=${service_code}`, {
        headers: { "AUTH-KEY": params.api_key },
        next: { revalidate: 0 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      const r = json?.postage_result;
      if (!r?.cost) return null;
      return {
        service_code,
        name,
        price: Math.round(parseFloat(r.cost) * 100),
        eta: r.days ? `${r.days} business day${r.days === "1" ? "" : "s"}` : "varies",
      };
    } catch {
      return null;
    }
  }

  const [standard, express] = await Promise.all([
    fetchRate("AUS_PARCEL_REGULAR", "Standard Parcel Post"),
    fetchRate("AUS_PARCEL_EXPRESS", "Express Parcel Post"),
  ]);

  return { standard, express };
}
