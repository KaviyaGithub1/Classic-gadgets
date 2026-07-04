'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Search, Heart, ShoppingCart, Star, SlidersHorizontal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Apple iPhone 16 Pro Max', brand: 'Apple', category: 'Smartphones', price: 144900, stock: 45, discount: 5, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=500&auto=format&fit=crop'] },
  { id: '2', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'Smartphones', price: 129999, stock: 20, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop'] },
  { id: '3', name: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'Headphones', price: 29990, stock: 120, discount: 15, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop'] },
  { id: '4', name: 'MacBook Pro M3 Max 16-inch', brand: 'Apple', category: 'Laptops', price: 349900, stock: 5, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop'] },
  { id: '5', name: 'Apple Watch Ultra 2', brand: 'Apple', category: 'Smart Watches', price: 89900, stock: 35, discount: 8, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1434493789847-2902641492d2?q=80&w=500&auto=format&fit=crop'] },
  { id: '6', name: 'Sony Alpha 7R V Mirrorless Camera', brand: 'Sony', category: 'Cameras', price: 334990, stock: 0, discount: 0, status: 'OUT_OF_STOCK', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop'] },
  { id: '7', name: 'PlayStation 5 Console', brand: 'Sony', category: 'Gaming', price: 49990, stock: 12, discount: 10, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=500&auto=format&fit=crop'] },
  { id: '8', name: 'iPad Pro 13-inch M4', brand: 'Apple', category: 'Tablets', price: 129900, stock: 50, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop'] },
  { id: '9', name: 'DJI Mini 4 Pro Drone', brand: 'DJI', category: 'Cameras', price: 76000, stock: 8, discount: 5, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=500&auto=format&fit=crop'] },
  { id: '10', name: 'Bose QuietComfort Ultra Earbuds', brand: 'Bose', category: 'Headphones', price: 26900, stock: 60, discount: 12, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500&auto=format&fit=crop'] },
  { id: '11', name: 'ASUS ROG Zephyrus G14 Gaming Laptop', brand: 'ASUS', category: 'Laptops', price: 189999, stock: 15, discount: 7, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=500&auto=format&fit=crop'] },
  { id: '12', name: 'Google Pixel 9 Pro', brand: 'Google', category: 'Smartphones', price: 109999, stock: 30, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=500&auto=format&fit=crop'] },
];

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Headphones', 'Smart Watches', 'Cameras', 'Gaming', 'Tablets'];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        setProducts(response.data.length > 0 ? response.data : MOCK_PRODUCTS);
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Discover Gadgets
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Explore our premium collection of cutting-edge tech. Find your next favourite gadget.
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gadgets, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-5 h-5 text-gray-400 shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isLoading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-xl font-medium">No gadgets found for "{search}"</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-4 text-indigo-600 underline text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const image = product.images?.[0] || '';
              const finalPrice = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;
              const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
              const wishlisted = isInWishlist(product.id);

              return (
                <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col relative">

                  {/* Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Wishlist button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors hover:scale-110"
                  >
                    <Heart className={cn('w-4 h-4 transition-colors', wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                  </button>

                  {/* Image */}
                  <Link href={`/product/${product.id}`}>
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {image ? (
                        <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mb-1">{product.brand}</span>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{product.name}</h3>
                    </Link>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700'}`} />
                      ))}
                    </div>

                    <div className="mt-auto">
                      {/* Price */}
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-base font-black text-gray-900 dark:text-white">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {/* Stock badge */}
                      <div className="mb-3">
                        {isOutOfStock ? (
                          <span className="text-xs text-red-500 font-semibold">Out of Stock</span>
                        ) : (
                          <span className="text-xs text-emerald-500 font-semibold">✓ In Stock ({product.stock})</span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 rounded-xl"
                          disabled={isOutOfStock}
                          onClick={() => {
                            addToCart(product, 1);
                            toast.success(`${product.name} added to cart!`);
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                        <Link href={`/product/${product.id}`}>
                          <Button className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-300 p-0 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
