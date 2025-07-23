// app/components/header/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ShoppingCart, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    order: "asc",
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
        {/* Left Section (Logo) */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            ShopHub
          </Link>
        </div>

        {/* Center Section (Search Bar + Filter) */}
        <div className="relative flex-1 mx-6 max-w-4xl">
          <Input
            type="text"
            placeholder="Search themes..."
            className="w-full rounded-lg border-gray-300 pl-10 pr-14 text-sm focus:border-gray-400 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1.5"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <Filter className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute top-12 z-50 w-full rounded-md border bg-white p-4 shadow-lg dark:bg-gray-900">
              <div className="grid gap-3">
                <Input
                  placeholder="Category"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                />
                <Input
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                />
                <Input
                  placeholder="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                />
                <select
                  value={filters.order}
                  onChange={(e) =>
                    setFilters({ ...filters, order: e.target.value })
                  }
                  className="rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Section (Icons) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/signup">Signup</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/categories">Categories</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
