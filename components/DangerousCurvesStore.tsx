"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Heart, Star, Menu, ArrowRight, Filter, Share2, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const inventory = [
  {
    id: 1,
    name: "1992 Cherry Moto Jacket",
    era: "90s",
    size: "M",
    price: "$168",
    tag: "Rare Find",
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "Velvet Leopard Slip Dress",
    era: "90s",
    size: "S",
    price: "$124",
    tag: "Editor Pick",
    category: "Dresses",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "Midnight Fringe Western Boots",
    era: "80s",
    size: "7",
    price: "$142",
    tag: "Just In",
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "Rouge Satin Corset Top",
    era: "Y2K",
    size: "M",
    price: "$88",
    tag: "Bestseller",
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    name: "Faded Indigo Carpenter Jeans",
    era: "90s",
    size: "28",
    price: "$96",
    tag: "Daily Wear",
    category: "Denim",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    name: "Crystal Mesh Party Bag",
    era: "Y2K",
    size: "One Size",
    price: "$74",
    tag: "Collector",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
  },
];

const categories = ["All", "Outerwear", "Dresses", "Tops", "Denim", "Shoes", "Accessories"];

function ProductCard({ item }: { item: typeof inventory[0] }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Card className="group overflow-hidden rounded-3xl border-zinc-200 bg-white/90 shadow-sm backdrop-blur">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge className="rounded-full bg-black px-3 py-1 text-white hover:bg-black">{item.tag}</Badge>
            <Badge variant="secondary" className="rounded-full bg-white/90 px-3 py-1 text-zinc-900">
              {item.era}
            </Badge>
          </div>
          <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-zinc-900 shadow-sm transition hover:scale-105">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold tracking-tight text-zinc-950">{item.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {item.category} · Size {item.size}
              </p>
            </div>
            <p className="text-base font-semibold text-zinc-950">{item.price}</p>
          </div>
          <Button className="w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">
            Add to Bag
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DangerousCurvesStore() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
      const target = `${item.name} ${item.category} ${item.era} ${item.tag}`.toLowerCase();
      const matchQuery = target.includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-zinc-900">
      <section className="relative overflow-hidden border-b border-zinc-200 bg-[#ead9cb]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.8),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.55),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-zinc-300 bg-white/70 p-3 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Vintage since forever</p>
                <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Dangerous Curves</h1>
              </div>
            </div>
            <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-700 lg:flex">
              <a href="#new" className="transition hover:text-zinc-950">New Arrivals</a>
              <a href="#collection" className="transition hover:text-zinc-950">Shop</a>
              <a href="#about" className="transition hover:text-zinc-950">About</a>
              <a href="#journal" className="transition hover:text-zinc-950">Style Notes</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="rounded-2xl border border-zinc-300 bg-white/80 p-3">
                <Search className="h-5 w-5" />
              </button>
              <button className="rounded-2xl border border-zinc-300 bg-white/80 p-3">
                <Heart className="h-5 w-5" />
              </button>
              <button className="rounded-2xl border border-zinc-300 bg-zinc-950 p-3 text-white shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Badge className="rounded-full bg-zinc-950 px-4 py-2 text-white hover:bg-zinc-950">
                Curated vintage, one-of-one energy
              </Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
                  Bold vintage for nights that deserve a scene.
                </h2>
                <p className="max-w-xl text-base leading-7 text-zinc-700 sm:text-lg">
                  Dangerous Curves is an online vintage boutique packed with iconic silhouettes, glam textures,
                  and statement pieces from the 80s, 90s, and Y2K.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button className="rounded-2xl bg-zinc-950 px-6 py-6 text-base text-white hover:bg-zinc-800">
                  Shop New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="rounded-2xl border-zinc-400 bg-white/70 px-6 py-6 text-base">
                  Explore Lookbook
                </Button>
              </div>
              <div className="grid max-w-2xl grid-cols-3 gap-4 pt-2">
                {[
                  ["500+", "One-of-a-kind pieces"],
                  ["Weekly", "Fresh drops every Friday"],
                  ["4.9★", "Loved by vintage collectors"],
                ].map(([value, label]) => (
                  <Card key={label} className="rounded-3xl border-zinc-200 bg-white/75 shadow-sm">
                    <CardContent className="p-5">
                      <p className="text-2xl font-black tracking-tight">{value}</p>
                      <p className="mt-1 text-sm text-zinc-600">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-10 hidden rounded-3xl bg-white/90 p-4 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-zinc-950 p-2 text-white">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">This week&apos;s obsession</p>
                    <p className="text-sm text-zinc-500">Leopard velvet &amp; cherry leather</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-10 hidden rounded-3xl bg-[#5f2e39] px-5 py-4 text-white shadow-xl md:block">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Drop</p>
                <p className="text-2xl font-black">Friday 8 PM</p>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-white/50 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80"
                  alt="Dangerous Curves vintage fashion hero"
                  className="aspect-[4/5] w-full object-cover lg:aspect-[4/4.6]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="new" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] border border-zinc-200 bg-white/75 p-6 shadow-sm md:grid-cols-3 md:p-8">
          {[
            {
              title: "Curated Weekly Drops",
              body: "Fresh arrivals every Friday night with runway attitude and collector-level finds.",
            },
            {
              title: "Measurements Included",
              body: "Every piece is photographed and measured for a better fit, better feel, and fewer surprises.",
            },
            {
              title: "Small-Batch Styling",
              body: "Pairing notes and era-inspired edits to help you style every piece with confidence.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="rounded-3xl border-zinc-200 bg-transparent shadow-none">
              <CardContent className="p-4">
                <p className="text-xl font-bold tracking-tight">{feature.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Shop the rack</p>
            <h3 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">Featured Collection</h3>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search styles, eras, moods..."
                className="rounded-2xl border-zinc-300 bg-white pl-10"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button variant="outline" className="rounded-2xl border-zinc-300 bg-white whitespace-nowrap">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "rounded-2xl bg-zinc-950 text-white whitespace-nowrap hover:bg-zinc-800"
                      : "rounded-2xl border-zinc-300 bg-white whitespace-nowrap"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-zinc-200 bg-[#231815] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">About the store</p>
            <h3 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Vintage with grit, glamour, and a little danger.
            </h3>
          </div>
          <div className="space-y-6 text-base leading-7 text-white/75">
            <p>
              Dangerous Curves is built for shoppers who want the thrill of a true vintage score without digging for hours.
              Every piece is hand-selected for shape, texture, drama, and wearability.
            </p>
            <p>
              Think leather, lace, denim, sparkle, and silhouettes that know exactly how to enter a room. No mass-produced basics.
              Just unforgettable clothes with history and attitude.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {["One-of-One", "Handpicked", "Measured", "Photographed In-House"].map((pill) => (
                <Badge key={pill} variant="secondary" className="rounded-full bg-white/10 px-4 py-2 text-white">
                  {pill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="journal" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Style notes</p>
            <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">What to wear now</h3>
          </div>
          <Button variant="ghost" className="rounded-2xl">Read Journal <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "How to style a leopard slip for daylight",
              body: "Layer it with worn-in denim, a chunky cardigan, and stacked jewelry for a softer edge.",
            },
            {
              title: "The return of sharp shoulder jackets",
              body: "An oversized power silhouette changes everything, especially over a fitted mini or vintage tee.",
            },
            {
              title: "Why Y2K bags still hit so hard",
              body: "Compact, sparkly, and a little impractical — exactly the energy your outfit needs.",
            },
          ].map((post) => (
            <Card key={post.title} className="rounded-3xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-xl font-bold tracking-tight">{post.title}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{post.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Dangerous Curves</p>
            <h4 className="mt-3 text-3xl font-black uppercase tracking-tight">Stay on the guest list.</h4>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Get first access to fresh drops, styling notes, and collector-worthy finds before they disappear.
            </p>
            <div className="mt-5 flex max-w-md gap-3">
              <Input placeholder="Email address" className="rounded-2xl border-zinc-300" />
              <Button className="rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">Join</Button>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="rounded-3xl border-zinc-200 bg-[#f7f1e8] shadow-none">
              <CardContent className="space-y-4 p-6 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-950">Visit &amp; Connect</p>
                <div className="flex items-center gap-3"><Share2 className="h-4 w-4" /> @dangerouscurvesvintage</div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4" /> hello@dangerouscurves.com</div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Online boutique · Ships worldwide</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 bg-[#f7f1e8] shadow-none">
              <CardContent className="space-y-3 p-6 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-950">Customer Care</p>
                <p>Shipping &amp; Returns</p>
                <p>Size Guide</p>
                <p>FAQ</p>
                <p>Gift Cards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </footer>
    </div>
  );
}
