'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, Search, ShoppingCart, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { toast } from 'sonner'

export default function Header() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/category/all');
        const data = await response.json();
        if (data.status !== 'success') {
          toast.error('Failed to fetch categories');
          throw new Error(data.message);
        }
        setCategories(data.data);
      } catch (error) {
        toast.error('Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  const selectStyles =
    'w-full border rounded-md px-3 py-2 text-sm bg-white text-black border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5B3DF4] transition duration-200'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-20">
      <div className="container max-w-screen-2xl px-2 mx-auto sm:px-4 py-4">
        <div className="flex items-center gap-1 justify-between sm:gap-6">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/">
              <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #5B3DF4, #7C3AED)' }}>
                ShopHub
              </h1>
            </Link>
          </div>

          {/* Middle: Search bar */}
          <div className="hidden md:flex flex-1 mx-1 m-w-0">
            <div className="relative w-full flex">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-12"
              />
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10 transition"
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 space-y-2 shadow-lg">
                  <select className={selectStyles}>
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Input type="number" placeholder="Min Price" />
                  <Input type="number" placeholder="Max Price" />
                  <select className={selectStyles}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile search icon */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition"
                onClick={() => {
                  setMobileSearchOpen((prev) => !prev)
                  setMobileFilterOpen(false)
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Icon */}
            <Button variant="ghost" size="icon" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 relative hover:bg-primary/10">
                  <User className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 space-y-2 shadow-md">
                <Link href="/login" className="block text-sm hover:text-[#5B3DF4] transition">Login</Link>
                <Link href="/signup" className="block text-sm hover:text-[#5B3DF4] transition">Signup</Link>
                <Link href="/categories" className="block text-sm hover:text-[#5B3DF4] transition">Categories</Link>
                <Link href="/dashboard" className="block text-sm hover:text-[#5B3DF4] transition">Dashboard</Link>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile: Search + Filter */}
        {mobileSearchOpen && (
          <div className="mt-4 md:hidden space-y-2 transition-all">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-10 py-2 h-11 w-full rounded-xl border border-input bg-background text-base placeholder:text-muted-foreground shadow-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10 transition"
                onClick={() => setMobileFilterOpen((prev) => !prev)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {mobileFilterOpen && (
              <div className="space-y-2 w-full">
                <select className={selectStyles}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Input type="number" placeholder="Min Price" />
                <Input type="number" placeholder="Max Price" />
                <select className={selectStyles}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}