'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { HeroSlider } from '@/components/HeroSlider';

export default function Home() {
  const [showAllProducts, setShowAllProducts] = useState(false);
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950">
      {/* Welcome Section */}
      <section className="relative w-full pt-32 pb-12 px-6 lg:px-8 text-center flex flex-col items-center bg-white dark:bg-gray-950">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
          Welcome to Classic Gadgets
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mb-8 leading-relaxed">
          Discover the latest electronic gadgets, smart devices, and innovative technology. 
          Shop premium products with unbeatable prices and trusted quality.
        </p>
        <Link href="#store">
          <Button size="lg" className="px-10 h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105">
            Shop Now
          </Button>
        </Link>
      </section>

      {/* Hero Slider Section */}
      <section className="relative w-full z-0 overflow-hidden shadow-xl border-y border-gray-200 dark:border-gray-800">
        <HeroSlider />
      </section>

      {/* Featured Products Section */}
      <section id="store" className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20 border-t border-gray-100 dark:border-gray-900">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Trending Gadgets
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Handpicked premium devices just for you.
            </p>
          </div>
        </div>

        <ProductGrid limit={showAllProducts ? 8 : 4} />

        <div className="mt-12 flex justify-center">
          <Button 
            variant="outline" 
            className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-8 py-2.5 rounded-xl font-bold"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? 'Show Less' : 'View All Products'}
          </Button>
        </div>
      </section>

    </div>
  );
}
