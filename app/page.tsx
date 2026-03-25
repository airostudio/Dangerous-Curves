import Link from "next/link";
import { ArrowRight, Flame, Star, Zap, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getFeaturedProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b-2 border-cherry bg-charcoal text-white">
          <div className="bg-pinstripe absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <Badge variant="default" className="text-sm">
                  <Flame className="mr-1 h-3 w-3" /> New Arrivals Every Friday
                </Badge>
                <h1 className="font-rockabilly text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                  Dress like the
                  <span className="text-cherry"> devil</span> on your
                  <span className="text-gold"> shoulder.</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-warm-gray">
                  Dangerous Curves is a hand-picked vintage boutique stocked with
                  rockabilly fire, pin-up glamour, and one-of-a-kind pieces that
                  refuse to blend in.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link href="/store">
                      Shop the Collection <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link href="/store?category=Dresses">Browse Dresses</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border-2 border-cherry shadow-2xl shadow-cherry/20">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                    alt="Vintage rockabilly fashion"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-xl border-2 border-cherry bg-charcoal px-4 py-3 shadow-lg">
                  <p className="font-rockabilly text-2xl text-cherry">500+</p>
                  <p className="text-xs uppercase tracking-widest text-warm-gray">Unique pieces</p>
                </div>
                <div className="absolute -right-4 top-8 rounded-xl border-2 border-gold bg-charcoal px-4 py-3 shadow-lg">
                  <p className="font-rockabilly text-2xl text-gold">4.9</p>
                  <p className="text-xs uppercase tracking-widest text-warm-gray">Star rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-b border-warm-gray bg-cream-dark">
          <div className="mx-auto grid max-w-7xl gap-0 divide-x divide-warm-gray px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              { icon: Star, title: "Hand-Picked", desc: "Every piece curated for quality and attitude" },
              { icon: Zap, title: "One-of-a-Kind", desc: "No two pieces the same — true vintage finds" },
              { icon: Truck, title: "Ships Worldwide", desc: "Tracked shipping to your door" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-5">
                <Icon className="h-6 w-6 shrink-0 text-cherry" />
                <div>
                  <p className="font-bold uppercase tracking-wide text-charcoal">{title}</p>
                  <p className="text-sm text-charcoal-light/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="bg-pinstripe mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cherry">Hot off the rack</p>
              <h2 className="font-rockabilly mt-1 text-3xl sm:text-4xl">Featured Picks</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/store">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* About CTA */}
        <section className="border-y-2 border-cherry bg-charcoal text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-script text-lg text-cherry">Not your average thrift store</p>
              <h2 className="font-rockabilly mt-2 text-3xl sm:text-4xl">
                Vintage with grit, glamour, and a little danger.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-warm-gray">
                Think leather, lace, leopard print, and silhouettes that know
                exactly how to enter a room. No mass-produced basics — just
                unforgettable clothes with history and attitude.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {["Rockabilly", "Pin-Up", "50s Greaser", "80s Glam", "Vintage Denim"].map((tag) => (
                  <Badge key={tag} variant="outline" className="border-warm-gray/30 text-warm-gray">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-checker mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-charcoal bg-white p-8 text-center shadow-lg sm:p-12">
            <Flame className="mx-auto h-8 w-8 text-cherry" />
            <h2 className="font-rockabilly mt-3 text-3xl">Stay on the Guest List</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-light/70">
              New drops, styling tips, and first dibs on the rarest vintage finds. Delivered every Friday.
            </p>
            <form className="mx-auto mt-6 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-lg border-2 border-warm-gray bg-cream px-4 py-2.5 text-sm focus:border-cherry focus:outline-none"
              />
              <Button type="submit">Join</Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
