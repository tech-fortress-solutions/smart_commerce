'use client'

import React, { useState, useEffect, useCallback, type FC, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { ShoppingCart, Star, Heart, MessageCircle, Loader2, AlertTriangle, ChevronRight, ShoppingBag } from 'lucide-react'
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
  }
};

// --- REUSABLE COMPONENTS FROM src/app/page.tsx ---

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

// Component for left/right staggered animations on grid items
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
      <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
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

const WhatsAppButton = () => (
    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center justify-center">
      <MessageCircle className="h-7 w-7" />
    </a>
)


// --- MAIN CATEGORY PAGE COMPONENT ---

export default function CategoryPage() {
  const { id } = useParams()
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('Category');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryProducts = useCallback(async (categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/product/category/${categoryId}`);
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        setProducts(response.data.data);
        setCategoryName(response.data.data[0].category.name);
      } else {
        // Handle API success with no products returned
        setProducts([]);
        // Try to fetch category name separately if needed, or default
        try {
          const categoryResponse = await api.get(`/admin/category/${categoryId}`);
          setCategoryName(categoryResponse.data.data.name);
        } catch (catErr) {
          console.error("Failed to fetch category name:", catErr);
          setCategoryName('Unknown Category');
        }
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setError('No products found in this category.');
      } else {
        console.error('Failed to fetch category products:', err);
        setError('An unexpected error occurred while fetching products.');
        toast.error('Failed to load category products.');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCategoryProducts(id);
    }
  }, [id, fetchCategoryProducts]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading products for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-semibold">No Products Found</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}><Loader2 className={`mr-2 h-4 w-4 ${!loading ? 'hidden' : 'animate-spin'}`} /> Try Again</Button>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 space-y-12">
        <ScrollAnimatedSection className="text-center" delay={0}>
          <h1 className="text-4xl md:text-5xl font-bold">{categoryName}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-2">
            Browse through our collection of products in this category.
          </p>
        </ScrollAnimatedSection>
        
        {products.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
            <h2 className="text-2xl font-semibold">No Products Found</h2>
            <p className="text-muted-foreground max-w-md">It looks like there are no products in this category yet. Check back later!</p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </div>
        ) : (
          <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </CardGridWithAnimation>
        )}
      </div>
      <WhatsAppButton />
    </main>
  );
}