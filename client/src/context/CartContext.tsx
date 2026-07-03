'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalItems: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shopping_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = items.find(i => i.id === product.id);
    const finalPrice = product.discount > 0 
      ? product.price * (1 - product.discount / 100) 
      : product.price;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} in stock.`);
        setItems(prev => prev.map(i => i.id === product.id ? { ...i, quantity: product.stock } : i));
      } else {
        toast.success(`Added to cart!`);
        setItems(prev => prev.map(i => i.id === product.id ? { ...i, quantity: newQuantity } : i));
      }
    } else {
      if (quantity > product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} in stock.`);
        setItems(prev => [...prev, {
          id: product.id,
          name: product.name,
          price: finalPrice,
          discount: product.discount || 0,
          image: product.images?.[0] || '',
          quantity: product.stock,
          stock: product.stock
        }]);
      } else {
        toast.success(`Added to cart!`);
        setItems(prev => [...prev, {
          id: product.id,
          name: product.name,
          price: finalPrice,
          discount: product.discount || 0,
          image: product.images?.[0] || '',
          quantity,
          stock: product.stock
        }]);
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;

    if (quantity > item.stock) {
      toast.error(`Only ${item.stock} units available`);
      setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: item.stock } : i));
    } else {
      setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i));
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotalItems = items.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotalItems,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
