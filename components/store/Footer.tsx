import Link from "next/link";
import { Flame, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-cherry bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-cherry" />
              <p className="font-brand text-xl">Dangerous Curves</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-warm-gray">
              Curated vintage fashion for rebels, pin-ups, and
              anyone who believes clothes should make an entrance.
            </p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-cherry">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-warm-gray">
              <Link href="/store" className="transition hover:text-white">Shop All</Link>
              <Link href="/store?category=Dresses" className="transition hover:text-white">Dresses</Link>
              <Link href="/store?category=Outerwear" className="transition hover:text-white">Outerwear</Link>
              <Link href="/store?category=Shoes" className="transition hover:text-white">Shoes</Link>
              <Link href="/store?category=Accessories" className="transition hover:text-white">Accessories</Link>
            </div>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-cherry">Get In Touch</p>
            <div className="mt-3 flex flex-col gap-3 text-sm text-warm-gray">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cherry" />
                hello@dangerouscurves.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cherry" />
                Online boutique &middot; Ships worldwide
              </div>
            </div>
          </div>
        </div>
        <div className="divider-flames mt-10" />
        <p className="mt-6 text-center text-xs uppercase tracking-widest text-warm-gray">
          &copy; {new Date().getFullYear()} Dangerous Curves Vintage. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
