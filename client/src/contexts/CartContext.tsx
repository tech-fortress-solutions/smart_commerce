'use client'

import React, { createContext, useState, useEffect, useContext, type FC, type ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useAuth } from './AuthContext'

type CartItem = {
  _id: string;
  name: string;
  thumbnail: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  isDeal?: boolean;
};

type CartContextType = {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  checkout: (clientName: string, location: string) => Promise<string | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'shophub_cart';

const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const storedCart = sessionStorage.getItem(STORAGE_KEY);
    if (storedCart) {
      // Check if the cart is older than 24 hours
      const { timestamp, items } = JSON.parse(storedCart);
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < oneDay) {
        return items;
      }
    }
  }
  return [];
};

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart);

  useEffect(() => {
    // Save cart to session storage whenever it changes
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      items: cartItems,
    }));
  }, [cartItems]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        const newItems = prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
        toast.success(`Increased quantity of ${item.name}`);
        return newItems;
      } else {
        const newItems = [...prevItems, { ...item, quantity: 1 }];
        toast.success(`${item.name} added to cart`);
        return newItems;
      }
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item._id !== id);
      toast.info('Item removed from cart');
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item._id === id ? { ...item, quantity } : item
      );
      return newItems.filter(item => item.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    sessionStorage.removeItem(STORAGE_KEY);
    toast.info('Cart cleared');
  }, []);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const checkout = async (clientName: string, location: string) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return null;
    }

    if (!location || location.trim() === '') {
      toast.error("Please provide your location to proceed with the checkout.");
      return null;
    }

    try {
      const orderData: {
        clientName: string;
        products: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
        totalAmount: number;
        currency: string;
        location: string;
        clientId?: string;
      } = {
        clientName: clientName,
        products: cartItems.map(item => ({
          product: item._id,
          description: item.name,
          thumbnail: item.thumbnail,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
        currency: "NGN",
        location: location,
      };
      
      if (user) {
        orderData.clientId = user._id;
      }
      const response = await api.post('/admin/orders/stage', orderData);
      const { checkoutUrl } = response.data;
      
      // Clear the cart on successful checkout
      clearCart();
      toast.success("Order placed successfully! Redirecting to WhatsApp...");
      
      return checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Checkout failed. Please try again.");
      return null;
    }
  };


  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};