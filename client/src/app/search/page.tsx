'use client'

import React, { useState, useEffect, type FC, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { useSearchParams } from 'next/navigation'
import {
  Star,
  ShoppingCart,
  Heart,
  Loader2,
  AlertTriangle,
  Search as SearchIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useCart } from '@/contexts/CartContext'
import { BuyNowDialog } from '@/components/BuyNow'

// --- TYPE DEFINITIONS ---
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  isDeal?: boolean;
  rating?: number;
  thumbnail: string;
  category: {
    _id: string;
    name: string;
  };
};

// --- HELPER & SUB-COMPONENTS (Copied from your template) ---

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

  const items = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => {
        const isLeft = index % 2 === 0;
        const delay = index * 100;

        const animationClasses = inView
          ? 'opacity-100 translate-x-0'
          : isLeft
          ? 'opacity-0 -translate-x-8'
          : 'opacity-0 translate-x-8';

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

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const priceColorClass = product.isDeal ? 'text-destructive' : 'text-gray-900 dark:text-gray-50';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      _id: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      price: product.price,
      oldPrice: product.oldPrice,
      isDeal: product.isDeal
    });
  };

  const [isBuyNowDialogOpen, setIsBuyNowDialogOpen] = useState(false);
  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1 transition-transform duration-300 hover:-translate-y-0.5" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2"/>
          Add to Cart
        </Button>
        <Button onClick={handleBuyNowClick} className="flex-1 bg-blue-600 text-primary-foreground hover:bg-blue-500 transition-transform duration-300 hover:-translate-y-0.5">
          Buy Now
        </Button>
      </div>
      <BuyNowDialog
        isOpen={isBuyNowDialogOpen}
        onClose={handleCloseDialog}
        product={product}
      />
    </div>
  )
}

// --- Search Results Page Component ---
export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const searchQuery = searchParams.get('query') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const categoryName = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setProducts([]);
        setLoading(false);
        setIsNotFound(false); // Reset not found state
        return;
      }

      setLoading(true);
      setError(null);
      setIsNotFound(false); // Reset not found state before new search

      try {
        const params = new URLSearchParams();
        params.set('query', searchQuery);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (categoryName) params.set('category', categoryName);
        if (sortBy) params.set('sortBy', sortBy);
        if (sortOrder) params.set('sortOrder', sortOrder);

        const response = await api.get(`/admin/product/search?${params.toString()}`);
        if (response.data.status === 'success') {
          setProducts(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch search results.');
          toast.error(response.data.message || 'Failed to fetch search results.');
        }
      } catch (err: any) {
        console.error('Search API error:', err);
        if (err.response && err.response.status === 404) {
          setIsNotFound(true);
        } else {
          setError('An unexpected error occurred while fetching products.');
          toast.error('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, minPrice, maxPrice, categoryName, sortBy, sortOrder]);

  const getSortLabel = (sortParam: string, orderParam: string) => {
    if (!sortParam) return null;
    let label = '';
    switch(sortParam) {
      case 'price': label = 'Price'; break;
      case 'name': label = 'Name'; break;
      default: return null;
    }
    return `${label}: ${orderParam === 'asc' ? 'Low to High' : 'High to Low'}`;
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <ScrollAnimatedSection delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Results for "{searchQuery}"</h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {minPrice && <Badge variant="secondary">Min Price: ₦{minPrice}</Badge>}
              {maxPrice && <Badge variant="secondary">Max Price: ₦{maxPrice}</Badge>}
              {categoryName && <Badge variant="secondary">Category: {categoryName}</Badge>}
              {sortBy && <Badge variant="secondary">Sort: {getSortLabel(sortBy, sortOrder)}</Badge>}
            </div>
          </div>
        </ScrollAnimatedSection>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && !isNotFound && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold text-destructive">{error}</p>
          </div>
        )}

        {isNotFound && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold">No items matched your search.</h2>
            <p className="text-muted-foreground">Try a different search query or adjust your filters.</p>
          </div>
        )}

        {!loading && !error && !isNotFound && products.length > 0 && (
          <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </CardGridWithAnimation>
        )}
      </div>
    </main>
  );
}