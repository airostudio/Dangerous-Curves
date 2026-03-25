import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Dangerous Curves — Vintage & Rockabilly Fashion",
  description: "Curated vintage and rockabilly fashion. One-of-a-kind pieces with bold silhouettes, pin-up glamour, and rebel attitude.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
