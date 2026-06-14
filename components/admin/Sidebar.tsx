"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Flame, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r-2 border-warm-gray bg-charcoal text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-cherry" />
          <span className="font-brand text-sm">Dangerous Curves</span>
        </div>
        <p className="mt-1 text-xs text-warm-gray">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-cherry text-white"
                  : "text-warm-gray hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-warm-gray transition hover:bg-white/5 hover:text-white"
        >
          <Store className="h-4 w-4" />
          View Store
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-warm-gray transition hover:bg-white/5 hover:text-cherry"
          >
            <LogOut className="h-4 w-4" />
            Sign out ({username})
          </button>
        </form>
      </div>
    </aside>
  );
}
