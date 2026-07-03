'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartSubtotal, cartTotalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24" />;

  const tax = cartSubtotal * 0.08;
  const shipping = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 50;
  const total = cartSubtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our store to find amazing gadgets!
        </p>
        <Link href="/">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-full">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({cartTotalItems} Items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                
                {/* Image */}
                <div className="w-24 h-24 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <Link href={`/product/${item.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold mt-1 text-lg">
                    ₹{item.price.toFixed(2)}
                  </div>
                  {item.stock < 10 && (
                    <div className="text-xs font-medium text-orange-500 mt-1">
                      Only {item.stock} left in stock
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg h-10 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 h-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-3 h-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Total Price for this item */}
                  <div className="w-20 text-right font-bold text-gray-900 dark:text-white hidden sm:block">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping (Free over ₹500)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shipping === 0 ? <span className="text-emerald-500">Free</span> : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 group">
                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
