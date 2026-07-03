'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import { ProductQuickView } from './ProductQuickView';

const MOCK_PRODUCTS = [
  { 
    id: '1', name: 'Apple iPhone 16 Pro Max', brand: 'Apple', category: 'Smartphones', 
    price: 144900, stock: 45, discount: 5, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '2', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'Smartphones', 
    price: 129999, stock: 20, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '3', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', brand: 'Sony', category: 'Headphones', 
    price: 29990, stock: 120, discount: 15, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '4', name: 'MacBook Pro M3 Max 16-inch', brand: 'Apple', category: 'Laptops', 
    price: 349900, stock: 5, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '5', name: 'Apple Watch Ultra 2', brand: 'Apple', category: 'Smart Watches', 
    price: 89900, stock: 35, discount: 8, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1434493789847-2902641492d2?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '6', name: 'Sony Alpha 7R V Mirrorless Camera', brand: 'Sony', category: 'Cameras', 
    price: 334990, stock: 0, discount: 0, status: 'OUT_OF_STOCK', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '7', name: 'PlayStation 5 Console', brand: 'Sony', category: 'Gaming', 
    price: 49990, stock: 12, discount: 10, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=500&auto=format&fit=crop'] 
  },
  { 
    id: '8', name: 'iPad Pro 13-inch M4', brand: 'Apple', category: 'Tablets', 
    price: 129900, stock: 50, discount: 0, status: 'ACTIVE', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop'] 
  },
];

export const ProductGrid = ({ limit }: { limit?: number }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (error: any) {
        // Fallback for simulation if backend is down
        setProducts(MOCK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const displayProducts = limit ? products.slice(0, limit) : products;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onQuickView={() => setSelectedProduct(product)} 
          />
        ))}
      </div>

      <ProductQuickView 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
};

const ProductCard = ({ product, onQuickView }: { product: any, onQuickView: () => void }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Mock rating since it's not in DB schema yet
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 200) + 15;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    // Real app would redirect here, but for now just toast is fine or redirect to /cart
    // Using window.location.href to avoid adding useRouter dependency for this tiny change
    window.location.href = '/cart';
  };

  return (
    <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-6 flex items-center justify-center">
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 tracking-wide">
            {product.discount}% OFF
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-900/90 text-white font-bold px-5 py-2.5 rounded-xl border border-gray-700 shadow-xl tracking-wider">
              OUT OF STOCK
            </span>
          </div>
        )}

        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
            No Image
          </div>
        )}

        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-20">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className="w-10 h-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-white border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all hover:scale-110"
          >
            <Heart className={cn("w-4 h-4 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(); }}
            className="w-10 h-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-white border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all hover:scale-110"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[11px] font-bold tracking-widest text-indigo-500 uppercase">
            {product.brand}
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{rating}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-4 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-gray-100/80 dark:border-gray-800/80 flex items-end justify-between mb-6">
          <div>
            {product.discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through decoration-gray-300 font-medium">₹{product.price.toLocaleString()}</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  ₹{((product.price * (1 - product.discount / 100))).toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="text-xs font-bold uppercase tracking-wider">
            {isOutOfStock ? (
              <span className="text-red-500">Unavailable</span>
            ) : (
              <span className="text-emerald-500">{product.stock} Left</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" /> Add
          </Button>
          <Button 
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-md shadow-indigo-600/20"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
          >
            <Zap className="w-4 h-4" /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
