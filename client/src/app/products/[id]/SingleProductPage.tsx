'use client';

import React, { useState, useEffect, useCallback, type FC, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Star,
  ShoppingCart,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Send,
  Edit,
  Share2, // ADDED: Import the Share2 icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { BuyNowDialog } from '@/components/BuyNow';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

// --- TYPE DEFINITIONS ---
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  thumbnail: string;
  category: { _id: string; name: string };
  quantity: number;
  review?: number;
  numReviews?: number;
  isDeal?: boolean;
};

type Review = {
  _id: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
  };
  rating: number;
  comment?: string;
  // This is the new type definition for the admin response
  response?: {
    comment: string;
    responder?: string;
    responderId?: string;
    createdAt?: string;
  };
  createdAt: string;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
};

// --- HELPER & SUB-COMPONENTS ---
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
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 h-14">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">{product.description}</p>
          </div>
          {product.review && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.review!) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}/>
              ))}
              <span className="text-sm text-muted-foreground ml-1">({product.review.toFixed(1)})</span>
            </div>
          )}
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

const StarRating = ({ rating = 0, size = 'sm' }: { rating?: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const SingleProductPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params.id as string;
  const { addItem } = useCart();

  // --- Product Data State ---
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState<Product[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, totalReviews: 0 });

  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [currentRating, setCurrentRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  // NEW: State for the main page's Buy Now dialog
  const [isBuyNowDialogOpen, setIsBuyNowDialogOpen] = useState(false);
  // NEW: State for the admin reply functionality
  const [adminReply, setAdminReply] = useState<{ reviewId: string | null; comment: string }>({ reviewId: null, comment: '' });
  const [isSubmittingAdminReply, setIsSubmittingAdminReply] = useState(false);
  // NEW: State for editing user's review
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [updatedRating, setUpdatedRating] = useState(0);
  const [updatedComment, setUpdatedComment] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  // --- Data Fetching Logic ---
  const fetchProductData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productRes = await api.get(`/admin/product/${productId}`);
      const productData: Product = productRes.data.data;
      setProduct(productData);
      setMainImage(productData.thumbnail);

      // Fetch reviews
      const reviewsRes = await api.get(`/review/${productData._id}`);
      const reviewsData: Review[] = reviewsRes.data.data;
      setReviews(reviewsData);
      
      // NEW: Check if the logged-in user has already reviewed this product
      if (user) {
        const currentUserReview = reviewsData.find(r => r.user._id === user._id);
        setUserReview(currentUserReview || null);
        if (currentUserReview) {
          setCurrentRating(currentUserReview.rating);
          setReviewComment(currentUserReview.comment || '');
        }
      }

      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((acc, curr) => acc + curr.rating, 0);
        setReviewSummary({
          averageRating: totalRating / reviewsData.length,
          totalReviews: reviewsData.length,
        });
      }

      // Fetch related products (same category)
      const relatedRes = await api.get(`/admin/product/category/${productData.category._id}`);
      const relatedProductsData: Product[] = relatedRes.data.data.filter((p: Product) => p._id !== productId);
      setRelatedProducts(relatedProductsData.slice(0, 5)); // Limit to 5 related products

      // Fetch "you may also like" products (random, different category)
      const allProductsRes = await api.get('/admin/product/all');
      const otherProducts = allProductsRes.data.data.filter((p: Product) => p._id !== productId);
      // select random other products and shuffle them
      const otherProductsShuffled = otherProducts.sort(() => Math.random() - 0.5);
      setYouMayAlsoLike(otherProductsShuffled.slice(0, 5));

    } catch (err) {
      console.error("Failed to fetch product data:", err);
      setError("We couldn't load this product right now. Please try again later.");
      toast.error("Failed to load product data.");
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId, fetchProductData]);

  // --- Interaction Handlers ---
  const handleAddToCart = () => {
    if (!product) return;
    addItem({ 
      _id: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      price: product.price,
      oldPrice: product.oldPrice,
      isDeal: product.isDeal
    });
    toast.success(`${product.name} added to cart!`);
  };

  // FIX: Implemented logic to open the Buy Now dialog
  const handleBuyNowClick = () => {
    setIsBuyNowDialogOpen(true);
  };

  // FIX: Added handler to close the Buy Now dialog
  const handleCloseBuyNowDialog = () => {
    setIsBuyNowDialogOpen(false);
  };

  const handleWhatsAppClick = () => {
    const message = `I'm interested in the product: ${product?.name} (${window.location.href}). Can you tell me more about it?`;
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // ADDED: Share button handler
  const handleShareClick = async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing product: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link.');
      }
    }
  };

  const handleLeaveReview = async () => {
    if (!user) {
      router.push(`/auth/login?next=/products/${productId}`);
      return;
    }

    // Admins should not be able to leave a review
    if (user?.role === 'admin') {
      toast.error('Admins cannot leave reviews.');
      return;
    }

    if (!currentRating || !reviewComment || !orderReference) {
      toast.error('Please provide a rating, a comment, and your order reference.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/review/${orderReference}`, {
        product: productId,
        rating: currentRating,
        comment: reviewComment,
      });

      if (res.data.status === 'success') {
        toast.success('Your review has been submitted!');
        setReviewComment('');
        setCurrentRating(0);
        setOrderReference('');
        fetchProductData();
      } else {
        toast.error(res.data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Review submission failed:', err);
      toast.error('Failed to submit review. Please check your order reference and try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // NEW: Admin reply handler
  const handleAdminReply = async (reviewId: string) => {
    if (!user || user.role !== 'admin') {
      toast.error('You are not authorized to perform this action.');
      return;
    }

    if (!adminReply.comment) {
      toast.error('Please enter a response.');
      return;
    }

    setIsSubmittingAdminReply(true);
    try {
      const res = await api.put(`/review/${reviewId}`, {
        response: {
          comment: adminReply.comment,
        }
      });

      if (res.data.status === 'success') {
        toast.success('Response submitted successfully!');
        setAdminReply({ reviewId: null, comment: '' });
        fetchProductData();
      } else {
        toast.error(res.data.message || 'Failed to submit response.');
      }
    } catch (err) {
      console.error('Admin response submission failed:', err);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setIsSubmittingAdminReply(false);
    }
  };

  // NEW: Handler for initiating review update
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setUpdatedRating(review.rating);
    setUpdatedComment(review.comment || '');
  };

  // NEW: Handler for submitting the updated review
  const handleUpdateReview = async () => {
    if (!user || !editingReview) return;

    if (!updatedRating || !updatedComment) {
      toast.error('Please provide a rating and a comment.');
      return;
    }

    setIsUpdatingReview(true);
    try {
      const res = await api.put(`/review/${editingReview._id}`, {
        rating: updatedRating,
        comment: updatedComment,
      });

      if (res.data.status === 'success') {
        toast.success('Your review has been updated!');
        setEditingReview(null);
        setUpdatedRating(0);
        setUpdatedComment('');
        fetchProductData(); // Re-fetch all data to show the updated review
      } else {
        toast.error(res.data.message || 'Failed to update review.');
      }
    } catch (err) {
      console.error('Review update failed:', err);
      toast.error('Failed to update review. Please try again.');
    } finally {
      setIsUpdatingReview(false);
    }
  };
  
  // --- Render Loading/Error States ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-semibold">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground max-w-md">{error || 'Product not found.'}</p>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    );
  }
  
  // Calculate discount if applicable
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const priceColorClass = product.isDeal ? 'text-destructive' : 'text-gray-900 dark:text-gray-50';

  return (
    <div className="min-h-screen bg-background">
      {/* Smooth Scroll Style */}
      <style jsx global>{`html { scroll-behavior: smooth; }`}</style>

      {/* Back Button and Product Info Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <ScrollAnimatedSection>
            <Link href="/">
              <Button variant="ghost" className="mb-8 flex items-center">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </ScrollAnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
            {/* Image Gallery */}
            <ScrollAnimatedSection className="lg:order-1" delay={100}>
              <div className="flex flex-col-reverse md:flex-row gap-4">
                {/* Thumbnail Carousel */}
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px]">
                  {product.images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`${product.name} image ${index + 1}`}
                      width={100}
                      height={100}
                      className={`cursor-pointer rounded-lg border-2 transition-all hover:border-primary ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setMainImage(img)}
                    />
                  ))}
                </div>
                {/* Main Image */}
                <div className="flex-1 rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 hover:scale-105">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </ScrollAnimatedSection>

            {/* Product Details */}
            <ScrollAnimatedSection className="lg:order-2 space-y-6" delay={200}>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.category.name}</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewSummary.averageRating} size="md" />
                  <span className="text-muted-foreground text-sm">
                    ({reviewSummary.averageRating.toFixed(1)} / {reviewSummary.totalReviews} reviews)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-3xl md:text-4xl font-bold ${priceColorClass}`}>
                  ₦{product.price.toLocaleString()}
                </p>
                {product.oldPrice && (
                  <span className="text-muted-foreground line-through text-lg">
                    ₦{product.oldPrice.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    -{discount}%
                  </Badge>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
              <div>
                {product.quantity > 0 ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">
                      In Stock
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({product.quantity} items remaining)
                    </span>
                  </div>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-black transition-transform duration-300 hover:-translate-y-0.5" onClick={handleAddToCart} disabled={product.quantity === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-500 transition-transform duration-300 hover:-translate-y-0.5" onClick={handleBuyNowClick} disabled={product.quantity === 0}>
                  Buy Now
                </Button>
                <Button variant="outline" size="icon" onClick={handleWhatsAppClick} className="bg-green-500 text-white hover:bg-green-600 hover:text-white transition-transform duration-300 hover:-translate-y-0.5">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                {/* ADDED: Share button */}
                <Button variant="outline" size="icon" onClick={handleShareClick} className="transition-transform duration-300 hover:-translate-y-0.5">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 space-y-8">
            <ScrollAnimatedSection delay={100}>
              <h2 className="text-3xl font-bold">Related Products</h2>
            </ScrollAnimatedSection>
            <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </CardGridWithAnimation>
          </div>
        </section>
      )}

      {/* You May Also Like Section */}
      {youMayAlsoLike.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 space-y-8">
            <ScrollAnimatedSection delay={100}>
              <h2 className="text-3xl font-bold">You May Also Like</h2>
            </ScrollAnimatedSection>
            <CardGridWithAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {youMayAlsoLike.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </CardGridWithAnimation>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <ScrollAnimatedSection delay={100}>
            <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
            <div className="flex items-center gap-4 mb-8">
              <StarRating rating={reviewSummary.averageRating} size="lg" />
              <span className="text-2xl font-bold">
                {reviewSummary.averageRating.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">
                from {reviewSummary.totalReviews} reviews
              </span>
            </div>
          </ScrollAnimatedSection>

          {/* Leave a Review Form - Handles both creation and update */}
          {user?.role !== 'admin' && (
            <ScrollAnimatedSection delay={200}>
              <div className="bg-background rounded-xl shadow-lg p-6 mb-8">
                {userReview ? (
                  <h3 className="text-xl font-semibold mb-4">Update Your Review</h3>
                ) : (
                  <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                )}
                
                {/* Review Form - displays either the create or update form */}
                {editingReview ? (
                  // UPDATE REVIEW FORM
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= updatedRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                          }`}
                          onClick={() => setUpdatedRating(star)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Write your updated comment here..."
                      value={updatedComment}
                      onChange={(e) => setUpdatedComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingReview(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateReview}
                        disabled={isUpdatingReview || !updatedRating || !updatedComment}
                      >
                        {isUpdatingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Review'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // CREATE REVIEW FORM
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                          }`}
                          onClick={() => setCurrentRating(star)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Write your comment here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    {!userReview && (
                      <Input
                        placeholder="Enter your order reference here (e.g., oZaBwrIy66)"
                        value={orderReference}
                        onChange={(e) => setOrderReference(e.target.value)}
                      />
                    )}
                    <Button
                      className="bg-blue-600 hover:bg-blue-500"
                      onClick={handleLeaveReview}
                      disabled={submittingReview || !currentRating || !reviewComment || (!userReview && !orderReference)}
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        userReview ? 'Update Review' : 'Submit Review'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollAnimatedSection>
          )}

          {/* Display Reviews */}
          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <ScrollAnimatedSection key={review._id} delay={300 + index * 50}>
                  <div className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.user.firstname} {review.user.lastname}</h4>
                        <StarRating rating={review.rating} />
                        {/* NEW: Display a badge for the current user's review */}
                        {user?._id === review.user._id && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">Your Review</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {/* NEW: Edit button for the logged-in user's review */}
                        {user?._id === review.user._id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {/* NEW: Reply button for admins */}
                        {user?.role === 'admin' && !review.response?.comment && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdminReply({ reviewId: review._id, comment: '' })}
                          >
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* NEW: Conditionally render update form for the specific review */}
                    {editingReview && editingReview._id === review._id ? (
                      <div className="mt-4 p-4 bg-secondary rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">Update Your Review</h5>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-medium">New Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 cursor-pointer transition-colors ${
                                star <= updatedRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                              }`}
                              onClick={() => setUpdatedRating(star)}
                            />
                          ))}
                        </div>
                        <Textarea
                          placeholder="Write your updated comment here..."
                          value={updatedComment}
                          onChange={(e) => setUpdatedComment(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingReview(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateReview}
                            disabled={isUpdatingReview || !updatedRating || !updatedComment}
                          >
                            {isUpdatingReview ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Review'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    )}

                    {/* NEW: Admin Response display */}
                    {review.response?.comment && (
                      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-primary">Admin Response</span>
                          <span className="text-sm text-muted-foreground">
                            {review.response.createdAt && `(${new Date(review.response.createdAt).toLocaleDateString()})`}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.response.comment}</p>
                      </div>
                    )}

                    {/* NEW: Admin reply form - for a specific review */}
                    {user?.role === 'admin' && adminReply.reviewId === review._id && (
                      <div className="mt-4 flex gap-2">
                        <Input
                          placeholder="Write a response..."
                          value={adminReply.comment}
                          onChange={(e) => setAdminReply({ ...adminReply, comment: e.target.value })}
                        />
                        <Button
                          size="icon"
                          onClick={() => handleAdminReply(review._id)}
                          disabled={isSubmittingAdminReply || !adminReply.comment}
                        >
                          {isSubmittingAdminReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollAnimatedSection>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </section>

      {/* Buy Now Dialog component */}
      {product && (
        <BuyNowDialog
          isOpen={isBuyNowDialogOpen}
          onClose={handleCloseBuyNowDialog}
          product={product}
        />
      )}
    </div>
  );
};

export default SingleProductPage;