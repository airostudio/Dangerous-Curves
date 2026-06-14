"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b-2 border-cherry bg-charcoal text-white">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo is absolutely positioned so it hangs below the header's natural height */}
        <Link href="/" className="absolute left-4 top-0 z-10 sm:left-6 lg:left-8">
          <Image
            src="/logo.png"
            alt="Dangerous Curves"
            width={130}
            height={218}
            priority
            className="h-[120px] w-auto object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] lg:h-[170px]"
          />
        </Link>

        {/* Spacer reserves horizontal space for the logo */}
        <div className="w-[72px] shrink-0 lg:w-[102px]" />

        <nav className="hidden items-center gap-8 text-sm font-bold uppercase tracking-wider lg:flex">
          <Link href="/" className="transition hover:text-cherry">Home</Link>
          <Link href="/store" className="transition hover:text-cherry">Shop</Link>
          <Link href="/store?category=Dresses" className="transition hover:text-cherry">Dresses</Link>
          <Link href="/store?category=Outerwear" className="transition hover:text-cherry">Outerwear</Link>
          <Link href="/store?category=Accessories" className="transition hover:text-cherry">Accessories</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-lg bg-cherry p-2.5 transition hover:bg-cherry-dark"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-black text-charcoal">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/20 p-2.5 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-charcoal-light px-4 pb-4 pt-2 lg:hidden">
          {[
            { href: "/", label: "Home" },
            { href: "/store", label: "Shop All" },
            { href: "/store?category=Dresses", label: "Dresses" },
            { href: "/store?category=Outerwear", label: "Outerwear" },
            { href: "/store?category=Accessories", label: "Accessories" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm font-bold uppercase tracking-wider transition hover:text-cherry"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
