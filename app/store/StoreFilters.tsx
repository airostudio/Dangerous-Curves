"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

interface StoreFiltersProps {
  categories: string[];
  activeCategory: string;
  currentSearch: string;
}

export default function StoreFilters({ categories, activeCategory, currentSearch }: StoreFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [, startTransition] = useTransition();

  function navigate(category: string, q: string) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (q) params.set("q", q);
    const qs = params.toString();
    startTransition(() => {
      router.push(`/store${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(cat, search)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <form
        className="relative min-w-[250px]"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(activeCategory, search);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search styles, eras..."
          className="w-full rounded-lg border-2 border-warm-gray bg-white py-2 pl-9 pr-3 text-sm focus:border-cherry focus:outline-none"
        />
      </form>
    </div>
  );
}
