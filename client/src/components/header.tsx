'use client'

import Link from 'next/link'
import { useState, useEffect, type FC, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover'
import { Filter, Search, ShoppingCart, User, X, Plus, Minus, Loader2, MessageCircle, ShoppingBag, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext' // Import the useAuth hook
import Image from 'next/image'
import api from '@/lib/axios'

// --- Cart Item Component ---
const CartItem: FC<{ item: any }> = ({ item }) => {
  const { removeItem, updateQuantity } = useCart();
  return (
    <div className="flex items-center gap-4 py-2 border-b last:border-b-0">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image src={item.thumbnail} alt={item.name} fill style={{ objectFit: 'cover' }} className="rounded-md" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-gray-900 dark:text-white">₦{item.price.toLocaleString()}</span>
          {item.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">₦{item.oldPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => removeItem(item._id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};


// --- Checkout Dialog Component ---
const CheckoutDialog: FC<{ isOpen: boolean; onOpenChange: (open: boolean) => void }> = ({ isOpen, onOpenChange }) => {
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkout } = useCart();

  const handleCheckout = async () => {
    if (!clientName.trim()) {
      toast.error('Please enter your name to proceed.');
      return;
    }

    setLoading(true);
    const whatsappLink = await checkout(clientName);
    setLoading(false);

    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      onOpenChange(false); // Close the dialog
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {/* Hidden trigger for control */}
        <div className="hidden" />
      </PopoverTrigger>
      <PopoverContent align="center" side="top" className="w-80 p-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Enter Your Name</h4>
          <p className="text-sm text-muted-foreground">Please enter your name to complete the order via WhatsApp.</p>
          <Input
            placeholder="Your Full Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleCheckout} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="mr-2 h-4 w-4" />
              )}
              Continue to WhatsApp
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// --- Header Component ---
export default function Header() {
  // Use the useAuth hook to get the current user and loading state
  const { user, loading, logout } = useAuth();
  const { cartItems, cartTotal, cartCount } = useCart();
  const [filterOpen, setFilterOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
    <>
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
              <Popover open={isCartOpen} onOpenChange={setIsCartOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 hover:bg-primary/10 relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Shopping Cart</h3>
                    <PopoverClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><X className="h-4 w-4" /></Button>
                    </PopoverClose>
                  </div>
                  {cartItems.length > 0 ? (
                    <>
                      <div className="max-h-60 overflow-y-auto">
                        {cartItems.map(item => (
                          <CartItem key={item._id} item={item} />
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <span className="text-base font-semibold">Total:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₦{cartTotal.toLocaleString()}</span>
                      </div>
                      <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
                        Checkout via WhatsApp
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Your cart is empty.</p>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* User Menu */}
              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 relative hover:bg-primary/10">
                    <User className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 space-y-2 shadow-md">
                  <Link href="/promotions" className="block text-sm hover:text-[#5B3DF4] transition">Promotions</Link>
                  {/* Conditionally render links based on auth status */}
                  {!user && !loading && (
                    <>
                      <Link href="/login" className="block text-sm hover:text-[#5B3DF4] transition">Login</Link>
                      <Link href="/signup" className="block text-sm hover:text-[#5B3DF4] transition">Signup</Link>
                    </>
                  )}
                  {user && !loading && (
                    <>
                      <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-sm hover:text-[#5B3DF4] transition">Dashboard</Link>
                      <Button variant="ghost" className="w-full justify-start text-sm px-0 py-0 h-auto font-normal hover:text-destructive" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  )}
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
      <CheckoutDialog isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  )
}
