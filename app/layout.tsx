import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dangerous Curves — Vintage Boutique",
  description: "Curated vintage fashion from the 80s, 90s, and Y2K. One-of-a-kind pieces with bold silhouettes and statement style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
