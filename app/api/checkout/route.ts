import { NextResponse } from "next/server";
import Stripe from "stripe";
import { validateDiscountCode } from "@/lib/db";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  if (!STRIPE_SECRET) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your Vercel environment variables." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET);
  const { items, shipping, discount_code } = await request.json() as {
    items: { product_id: number; name: string; price: number; quantity: number; image_url?: string }[];
    shipping?: { name: string; price: number };
    discount_code?: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in cart" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Validate discount code server-side and create a one-time Stripe coupon
  let discountCouponId: string | undefined;
  let discountCodeId: number | undefined;
  if (discount_code) {
    const result = await validateDiscountCode(discount_code, subtotal);
    if (result) {
      discountCodeId = result.discount.id;
      const coupon = await stripe.coupons.create({
        amount_off: result.discount_amount,
        currency: "aud",
        duration: "once",
        name: `Discount (${discount_code.toUpperCase()})`,
      });
      discountCouponId = coupon.id;
    }
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: "aud",
      product_data: {
        name: item.name,
        ...(item.image_url ? { images: [item.image_url] } : {}),
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  if (shipping && shipping.price > 0) {
    line_items.push({
      price_data: {
        currency: "aud",
        product_data: { name: shipping.name },
        unit_amount: shipping.price,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    ...(discountCouponId ? { discounts: [{ coupon: discountCouponId }] } : {}),
    shipping_address_collection: {
      allowed_countries: ["AU", "NZ", "US", "GB", "CA"],
    },
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/cart`,
    metadata: {
      items: JSON.stringify(
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, price: i.price, name: i.name }))
      ),
      ...(discountCodeId ? { discount_code_id: String(discountCodeId) } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}
