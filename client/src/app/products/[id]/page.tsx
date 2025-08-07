// src/app/products/[id]/page.tsx

import type { Metadata } from 'next';
import api from '@/lib/axios';
import SingleProductPage from './SingleProductPage';

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

// --- DATA FETCHING ---
async function getProduct(productId: string): Promise<Product | null> {
  try {
    const productRes = await api.get(`/admin/product/${productId}`);
    return productRes.data.data;
  } catch (err) {
    console.error("Failed to fetch product data:", err);
    return null;
  }
}

// --- METADATA GENERATION (Corrected) ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    };
  }

  const description = product.description.substring(0, 150);
  const imageUrl = product.thumbnail;

  return {
    title: `${product.name} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description: description,
    openGraph: {
      title: `${product.name} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: description,
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      locale: 'en_US',
      type: 'website',
      // Correct placement of the images array
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: description,
      // Correct placement of the images array
      images: [imageUrl],
    },
  };
}

// --- PAGE COMPONENT ---
const ProductPage = () => {
  // Your SingleProductPage component logic goes here
  return <SingleProductPage />;
};

export default ProductPage;