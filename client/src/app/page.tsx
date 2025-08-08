'use client'

import React, { useState, useEffect, useCallback, useRef, type FC, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  ShoppingBag,
  Heart,
  MessageCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useCart } from '@/contexts/CartContext' // Import the useCart hook
import { BuyNowDialog } from '@/components/BuyNow' // <-- New Import

// --- TYPE DEFINITIONS ---
type PromotionProduct = {
  product: {
    _id: string;
    name: string;
    description: string;
    category: string;
    thumbnail: string;
    rating?: number;
  };
  quantity: number;
  mainPrice: number;
  promoPrice: number;
};

type Promotion = {
  _id: string;
  title: string;
  type: 'new stock' | 'discount promo' | 'buyOneGetOne';
  description?: string;
  startDate: string;
  endDate: string;
  discountPercentage?: number;
  buyOneGetOne?: boolean;
  products: PromotionProduct[];
  active: boolean;
  promoBanner: string | null;
};

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

type Product = {
  _id: string;
  name:string;
  description: string;
  price: number;
  oldPrice?: number;
  isDeal?: boolean;
  rating?: number;
  thumbnail: string;
  category: {
    _id: string;
    name: string;
  }
};


// --- HELPER & SUB-COMPONENTS ---

// Reusable vertical slide-in on scroll for titles/sections
const ScrollAnimatedSection: FC<{ children: ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${className} ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};

// Fixed: Component for left/right staggered animations on grid items
const CardGridWithAnimation: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Convert children to an array to map over
  const items = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => {
        const isLeft = index % 2 === 0;
        const delay = index * 100;

        const animationClasses = inView
          ? 'opacity-100 translate-x-0'
          : isLeft
          ? 'opacity-0 -translate-x-8' // Reduced from 20 to 8 for mobile screens
          : 'opacity-0 translate-x-8'; // Reduced from 20 to 8 for mobile screens

        return (
          <div
            key={index}
            className={`transition-all duration-1000 ease-out transform ${animationClasses}`}
            style={{ transitionDelay: `${delay}ms` }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};


const StarRating = ({ rating = 0 }: { rating?: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}/>
    ))}
    <span className="text-sm text-muted-foreground ml-1">({Number(rating).toFixed(1)})</span>
  </div>
);

const HeroSection = ({ promotions }: { promotions: Promotion[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const activePromotions = promotions.filter(p => p.active);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === activePromotions.length - 1 ? 0 : prev + 1))
  }, [activePromotions.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activePromotions.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (activePromotions.length > 1) {
      const timer = setInterval(nextSlide, 5000)
      return () => clearInterval(timer)
    }
  }, [activePromotions.length, nextSlide])
  
  if (activePromotions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <ScrollAnimatedSection>
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {activePromotions.map((promo) => (
                <div 
                  key={promo._id} 
                  className="w-full flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: promo.promoBanner || '' }} 
                />
              ))}
            </div>
              {activePromotions.length > 1 && (
                  <>
                      <Button onClick={prevSlide} variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-primary"><ChevronLeft /></Button>
                      <Button onClick={nextSlide} variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-primary"><ChevronRight /></Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {activePromotions.map((_, i) => (
                              <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-colors ${currentSlide === i ? 'bg-white' : 'bg-white/50'}`}/>
                          ))}
                      </div>
                  </>
              )}
          </div>
        </ScrollAnimatedSection>
      </div>
    </section>
  )
}

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  
  // Conditionally set the price color
  const priceColorClass = product.isDeal ? 'text-destructive' : 'text-gray-900 dark:text-gray-50';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the Link from firing
    addItem({
      _id: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      price: product.price,
      oldPrice: product.oldPrice,
      isDeal: product.isDeal
    });
  };

  // --- New Buy Now Logic ---
  const [isBuyNowDialogOpen, setIsBuyNowDialogOpen] = useState(false);
  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the Link from firing
    setIsBuyNowDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsBuyNowDialogOpen(false);
  };

  return (
    <div className="product-card group border rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product._id}`} passHref>
        <div className="relative overflow-hidden rounded-t-lg">
          <Image src={product.thumbnail} alt={product.name} width={300} height={300} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"/>
          {discount > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 animate-pulse">-{discount}%</Badge>
          )}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-9 w-9 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 rounded-full">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 h-14">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">{product.description}</p>
          </div>
          <StarRating rating={product.rating || 0} />
          <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${priceColorClass}`}>₦{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">₦{product.oldPrice.toLocaleString()}</span>
              )}
          </div>
        </div>
      </Link>
      {/* The buttons are now outside the Link component and have their own padding */}
      <div className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1 transition-transform duration-300 hover:-translate-y-0.5" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2"/>
          Add to Cart
        </Button>
        <Button onClick={handleBuyNowClick} className="flex-1 bg-blue-600 text-primary-foreground hover:bg-blue-500 transition-transform duration-300 hover:-translate-y-0.5">
          Buy Now
        </Button>
      </div>
      {/* New: Render the BuyNowDialog */}
      <BuyNowDialog
        isOpen={isBuyNowDialogOpen}
        onClose={handleCloseDialog}
        product={product}
      />
    </div>
  )
}

const FeaturedDeals = ({ products }: { products: Product[] }) => {
    const featuredProducts = products.filter(p => p.isDeal).slice(0, 5);
    if(featuredProducts.length === 0) return null;

    return (
      <section className="pt-4 pb-16 sm:pt-8 sm:pb-24">
          <div className="container mx-auto px-4 space-y-12">
              <ScrollAnimatedSection className="text-center" delay={200}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Deals</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Don't miss these amazing offers on premium products!</p>
              </ScrollAnimatedSection>
              <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
              </CardGridWithAnimation>
              {/* New: See More button */}
              <div className="flex justify-center mt-8">
                <Link href="/promotions">
                  <Button variant="outline" className="group">
                    See More Deals
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
          </div>
      </section>
    );
};

// --- NewArrivals COMPONENT refactored to use CardGridWithAnimation ---
const NewArrivals = ({ products }: { products: Product[] }) => {
  const newArrivalsProducts = products.slice(0, 5);
  if (newArrivalsProducts.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 space-y-12">
        <ScrollAnimatedSection className="text-center" delay={200}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">New Arrivals</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Be the first to get your hands on our latest stock!</p>
        </ScrollAnimatedSection>
        <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newArrivalsProducts.map((product) => <ProductCard key={product._id} product={product} />)}
        </CardGridWithAnimation>
        {/* New: See More button */}
        <div className="flex justify-center mt-8">
          <Link href="/promotions/new-arrivals">
            <Button variant="outline" className="group">
              See All New Arrivals
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const CategoriesSection = ({ categories }: { categories: Category[] }) => {
    if(categories.length === 0) return null;

    return (
      <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 space-y-12">
              <ScrollAnimatedSection className="text-center" delay={200}>
                      <h2 className="text-3xl md:text-4xl font-bold">Shop Our Top Categories</h2>
                      <p className="text-lg text-muted-foreground mt-2">Find what you're looking for with our curated collections.</p>
              </ScrollAnimatedSection>
              <CardGridWithAnimation className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {categories.map((category) => (
                      <Link href={`/categories/${category._id}`} key={category._id}>
                          <div className="group relative rounded-xl overflow-hidden text-white cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                              <Image src={category.image} alt={category.name} width={400} height={500} className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 brightness-[0.8]"/>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 p-6 w-full">
                                  <h3 className="text-2xl font-bold">{category.name}</h3>
                                  <p className="text-sm text-gray-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{category.description}</p>
                              </div>
                          </div>
                      </Link>
                  ))}
              </CardGridWithAnimation>
          </div>
      </section>
    );
}

const ProductsByCategories = ({ products, categories }: { products: Product[], categories: Category[] }) => (
  <section className="py-16 sm:py-24">
    <div className="container mx-auto px-4 space-y-16">
      {categories.map((category, index) => {
        const categoryProducts = products.filter(p => p.category._id === category._id).slice(0, 5);
        if (categoryProducts.length === 0) return null;

        return (
            <div key={category._id}>
                <ScrollAnimatedSection delay={index * 150}>
                    <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">{category.name}</h2>
                            <p className="text-muted-foreground mt-1">{category.description}</p>
                        </div>
                        <Button variant="link" className="text-primary hover:text-primary/80 transition-colors p-0 h-auto mt-2 sm:mt-0">
                            View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </ScrollAnimatedSection>
                <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (<ProductCard key={product._id} product={product} />))}
                </CardGridWithAnimation>
            </div>
        )
      })}
    </div>
  </section>
)

const WhatsAppButton = () => (
    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center justify-center">
      <MessageCircle className="h-7 w-7" />
    </a>
)


// --- MAIN PAGE COMPONENT ---

export default function HomePage() {
  // Data State
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discountPromoProducts, setDiscountPromoProducts] = useState<Product[]>([]);
  const [newStockProducts, setNewStockProducts] = useState<Product[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data Fetching Logic
  const fetchHomePageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [promoRes, categoryRes, productRes] = await Promise.all([
        api.get('/admin/promotion/active'), 
        api.get('/admin/category/all'),
        api.get('/admin/product/all')
      ]);
      
      const activePromotions: Promotion[] = promoRes.data.data;
      
      // Separate promotions into different types
      const discountPromos = activePromotions.filter(p => p.type === 'discount promo' || p.type === 'buyOneGetOne');
      const newStockPromos = activePromotions.filter(p => p.type === 'new stock');

      // Process products from discount/BOGO promotions
      const newDiscountPromoProducts = discountPromos.flatMap(promotion =>
        promotion.products.map(p => ({
          _id: p.product._id,
          name: p.product.name,
          description: p.product.description,
          price: p.promoPrice,
          oldPrice: p.mainPrice,
          isDeal: true,
          rating: Number(p.product.rating) || 0,
          thumbnail: p.product.thumbnail,
          category: { _id: p.product.category, name: promotion.title }
        }))
      );
      
      // Process products from new stock promotions
      const newNewStockProducts = newStockPromos.flatMap(promotion =>
        promotion.products.map(p => ({
          _id: p.product._id,
          name: p.product.name,
          description: p.product.description,
          price: p.mainPrice,
          oldPrice: undefined,
          isDeal: false,
          rating: p.product.rating || 0,
          thumbnail: p.product.thumbnail,
          category: { _id: p.product.category, name: promotion.title }
        }))
      );
      
      setPromotions(activePromotions);
      setDiscountPromoProducts(newDiscountPromoProducts);
      setNewStockProducts(newNewStockProducts);
      setCategories(categoryRes.data.data);
      setProducts(productRes.data.data);
      
    } catch (err) {
      console.error("Failed to fetch homepage data:", err);
      setError("We couldn't load the store right now. Please try again later.");
      toast.error("Failed to load store data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);

  // Render Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading the best deals for you...</p>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-semibold">Oops! Something went wrong.</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button onClick={fetchHomePageData}><Loader2 className={`mr-2 h-4 w-4 ${!loading ? 'hidden' : 'animate-spin'}`} /> Try Again</Button>
      </div>
    );
  }

  // Render Content
  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <HeroSection promotions={promotions} />
      <FeaturedDeals products={discountPromoProducts} />
      {newStockProducts.length > 0 && <NewArrivals products={newStockProducts} />}
      <CategoriesSection categories={categories} />
      <ProductsByCategories products={products} categories={categories} />
      <WhatsAppButton />
    </div>
  )
}