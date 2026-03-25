"use client";

import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterForm() {
  return (
    <section className="bg-checker mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border-2 border-charcoal bg-white p-8 text-center shadow-lg sm:p-12">
        <Flame className="mx-auto h-8 w-8 text-cherry" />
        <h2 className="font-rockabilly mt-3 text-3xl">Stay on the Guest List</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-light/70">
          New drops, styling tips, and first dibs on the rarest vintage finds. Delivered every Friday.
        </p>
        <form
          className="mx-auto mt-6 flex max-w-sm gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-lg border-2 border-warm-gray bg-cream px-4 py-2.5 text-sm focus:border-cherry focus:outline-none"
          />
          <Button type="submit">Join</Button>
        </form>
      </div>
    </section>
  );
}
