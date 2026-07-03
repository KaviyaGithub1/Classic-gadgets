'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  status: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistTotalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist from local storage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToWishlist = (product: any) => {
    const existing = items.find(item => item.id === product.id);
    if (existing) return; // Already in wishlist

    const newItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
      image: product.images?.[0],
      stock: product.stock,
      status: product.status
    };
    
    toast.success(`${product.name} added to wishlist!`);
    setItems(prev => [...prev, newItem]);
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product: any) => {
    const isExisting = items.some(item => item.id === product.id);
    if (isExisting) {
      setItems(prev => prev.filter(item => item.id !== product.id));
    } else {
      const newItem: WishlistItem = {
        id: product.id,
        name: product.name,
        price: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
        image: product.images?.[0],
        stock: product.stock,
        status: product.status
      };
      toast.success(`${product.name} added to wishlist!`);
      setItems(prev => [...prev, newItem]);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistTotalItems: items.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
