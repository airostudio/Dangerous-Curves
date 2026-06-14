import { NextResponse } from "next/server";
import { validateDiscountCode } from "@/lib/db";

export async function POST(request: Request) {
  const { code, order_total } = await request.json() as {
    code: string;
    order_total: number;
  };

  if (!code) return NextResponse.json({ valid: false, error: "Code required" }, { status: 400 });

  const result = await validateDiscountCode(code, order_total);
  if (!result) {
    return NextResponse.json({ valid: false, error: "Invalid or expired discount code" });
  }

  return NextResponse.json({
    valid: true,
    discount_id: result.discount.id,
    type: result.discount.type,
    value: result.discount.value,
    discount_amount: result.discount_amount,
  });
}
