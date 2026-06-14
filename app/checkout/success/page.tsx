import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Verify payment and create order
  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["customer_details"],
      });

      if (session.payment_status === "paid") {
        const { createOrder, getOrderByStripeSession } = await import("@/lib/db");
        const existing = await getOrderByStripeSession(session_id);
        if (!existing) {
          const items = JSON.parse(session.metadata?.items ?? "[]");
          await createOrder({
            customer_name: session.customer_details?.name ?? "Online Customer",
            customer_email: session.customer_details?.email ?? "",
            customer_address: [
              session.customer_details?.address?.line1,
              session.customer_details?.address?.city,
              session.customer_details?.address?.country,
            ].filter(Boolean).join(", "),
            stripe_session_id: session_id,
            items,
          });
        }
      }
    } catch (err) {
      console.error("Order creation error:", err);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <CheckCircle className="mx-auto h-16 w-16 text-teal" />
          <h1 className="font-brand mt-6 text-4xl sm:text-5xl">Order Confirmed!</h1>
          <p className="mt-4 text-lg text-charcoal/70">
            Thank you for your order. We&apos;ll be in touch with shipping details soon.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/store">
                Keep Shopping <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
