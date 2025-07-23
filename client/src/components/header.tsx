'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, Search, ShoppingCart, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Header() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const selectStyles =
    'w-full border rounded-md px-2 py-2 text-sm bg-white text-black border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl font-bold text-[#5B3DF4]">ShopHub</h1>
            </Link>
          </div>

          {/* Center - Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-3xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-12 py-2 h-10 w-full rounded-md border border-input bg-background text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 space-y-2">
                  <select className={selectStyles}>
                    <option value="">Select Category</option>
                    <option value="ui">UI Kits</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="portfolio">Portfolio</option>
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

          {/* Right - Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Search Icon */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10"
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

            {/* Cart */}
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <User className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 space-y-2">
                <Link href="/login" className="block text-sm">Login</Link>
                <Link href="/signup" className="block text-sm">Signup</Link>
                <Link href="/categories" className="block text-sm">Categories</Link>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile Search Bar Expanded */}
        {mobileSearchOpen && (
          <div className="mt-4 md:hidden space-y-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-10 py-2 h-10 w-full rounded-md border border-input bg-background text-base placeholder:text-muted-foreground"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                onClick={() => setMobileFilterOpen((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filters Dropdown */}
            {mobileFilterOpen && (
              <div className="space-y-2 w-full">
                <select className={selectStyles}>
                  <option value="">Select Category</option>
                  <option value="ui">UI Kits</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="portfolio">Portfolio</option>
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
