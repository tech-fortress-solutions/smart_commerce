'use client'

import React, { useState, useEffect, useCallback, type FC, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import {
  ShoppingCart,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useCart } from '@/contexts/CartContext'
import { BuyNowDialog } from '@/components/BuyNow'
import { use } from 'react';


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


// --- REUSABLE SUB-COMPONENTS ---

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
          <Image src={product.thumbnail} alt={product.name} width={300} height={300} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
          {discount > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 animate-pulse">-{discount}%</Badge>
          )}
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
          <ShoppingCart className="h-4 w-4 mr-2" />
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

// --- MAIN DEDICATED PROMOTION PAGE COMPONENT ---

const SinglePromotionPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const promotionId = resolvedParams.id;
  
  const fetchPromotion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/promotion/${promotionId}`);
      setPromotion(response.data.data.promotion);
    } catch (err: any) {
      console.error("Failed to fetch promotion details:", err);
      if (err.response && err.response.status === 404) {
        setError("This promotion could not be found.");
      } else {
        setError("We couldn't load the promotion details. Please try again later.");
        toast.error("Failed to load promotion details.");
      }
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId, fetchPromotion]);
  
  // Render Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading promotion details...</p>
      </div>
    );
  }
  
  // Render Error/Not Found State
  if (error || !promotion) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-semibold">Promotion Not Found</h2>
        <p className="text-muted-foreground max-w-md">{error || 'The promotion you are looking for does not exist or is no longer active.'}</p>
        <Link href="/promotions">
          <Button>View All Promotions</Button>
        </Link>
      </div>
    );
  }
  
  // Render Promotion Content
  const promoProducts: Product[] = promotion.products.map(p => ({
    _id: p.product._id,
    name: p.product.name,
    description: p.product.description,
    price: p.promoPrice,
    oldPrice: p.mainPrice,
    isDeal: true,
    rating: p.product.rating || 0,
    thumbnail: p.product.thumbnail,
    category: { _id: p.product.category, name: promotion.title }
  }));
  
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 space-y-16">
        <ScrollAnimatedSection delay={0} className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{promotion.title}</h1>
          {promotion.description && (
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">{promotion.description}</p>
          )}
        </ScrollAnimatedSection>
        
        <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {promoProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </CardGridWithAnimation>
      </div>
    </div>
  );
};

export default SinglePromotionPage;