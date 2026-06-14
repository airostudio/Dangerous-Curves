"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Settings,
  LogOut, Flame, Store, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, onClick }: {
  href: string; label: string; icon: React.ElementType; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-cherry text-white" : "text-warm-gray hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ username, onClose }: { username: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-cherry" />
            <span className="font-brand text-sm">Dangerous Curves</span>
          </div>
          <p className="mt-0.5 text-xs text-warm-gray">Admin Panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-warm-gray hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map(item => <NavItem key={item.href} {...item} onClick={onClose} />)}
      </nav>

      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-warm-gray transition hover:bg-white/5 hover:text-white"
          onClick={onClose}
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
    </div>
  );
}

export default function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-charcoal text-white lg:flex">
        <SidebarContent username={username} />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-charcoal text-white transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent username={username} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex shrink-0 items-center gap-3 border-b-2 border-warm-gray bg-charcoal px-4 py-3 text-white lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-warm-gray hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-cherry" />
            <span className="font-brand text-sm">Dangerous Curves</span>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
