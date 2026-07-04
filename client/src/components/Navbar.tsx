'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LogIn, User, Heart, Search, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Cookies from 'js-cookie';

export const Navbar = () => {
  const pathname = usePathname();
  const { cartTotalItems } = useCart();
  const { wishlistTotalItems } = useWishlist();
  const [isMounted, setIsMounted] = useState(false);
  
  const token = Cookies.get('auth_token');
  const role = Cookies.get('user_role');

  // Prevent hydration mismatch for the cart/wishlist badges
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide Navbar on Admin pages, user dashboard layout might have its own sidebar but let's hide navbar for /admin and /dashboard
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">
              Classic Gadgets
            </span>
          </Link>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <div className="flex w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
              
              {/* Category Dropdown */}
              <div className="relative group flex items-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer px-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">All Categories</span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-300">
                    {['Smartphones', 'Laptops', 'Headphones', 'Smart Watches', 'Cameras', 'Gaming', 'Accessories'].map(cat => (
                      <li key={cat}>
                        <a href="#" className="block px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {cat}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Search Input */}
              <input 
                type="text" 
                placeholder="Search for gadgets..."
                className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                suppressHydrationWarning={true}
              />

              {/* Search Button */}
              <button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 flex items-center justify-center transition-colors"
                suppressHydrationWarning={true}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            
            <Link href="/wishlist" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Heart className="w-6 h-6" />
              {isMounted && wishlistTotalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 border-2 border-white dark:border-gray-950 rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {wishlistTotalItems > 99 ? '99+' : wishlistTotalItems}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {isMounted && cartTotalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 border-2 border-white dark:border-gray-950 rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {cartTotalItems > 99 ? '99+' : cartTotalItems}
                </span>
              )}
            </Link>

            {isMounted && token ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            ) : (
              <Link 
                href="/register" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};
