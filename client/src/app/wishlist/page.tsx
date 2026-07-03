'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist, wishlistTotalItems } = useWishlist();
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMoveToCart = (item: any) => {
    // Add to cart with quantity 1
    addToCart(item, 1);
    // Optionally, some stores keep it in wishlist, some remove it. Let's remove it to act like "move"
    removeFromWishlist(item.id);
  };

  if (!isMounted) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24" />;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your wishlist is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Save your favorite items here so you can easily find them later and add them to your cart.
        </p>
        <Link href="/products">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-full">
            Discover Gadgets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-1">{wishlistTotalItems} {wishlistTotalItems === 1 ? 'Item' : 'Items'} saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
              
              {/* Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <Link href={`/product/${item.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{item.name}</h3>
                </Link>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {item.stock > 0 ? (
                        <span className="text-emerald-500">In Stock</span>
                      ) : (
                        <span className="text-red-500">Out of Stock</span>
                      )}
                    </span>
                  </div>

                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md font-medium h-11 rounded-xl"
                    disabled={item.stock === 0}
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Move to Cart
                  </Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
