'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart, Zap, ArrowLeft, Minus, Plus, ShieldCheck, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { CheckoutModal } from '@/features/orders/components/CheckoutModal';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // Interactive states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        setProduct(response.data);
      } catch (error: any) {
        // Fallback for simulation
        if (error.code === 'ERR_NETWORK') {
          setProduct({
            id: id,
            name: 'Premium Wireless Headphones',
            brand: 'AudioTech',
            category: 'Electronics',
            description: 'Experience pure sound with these ultra-premium noise-cancelling headphones. Featuring 40 hours of battery life, spatial audio, and memory foam ear cups for all-day comfort. Designed for audiophiles who demand the best.',
            price: 299.99,
            stock: 45,
            discount: 10,
            status: 'ACTIVE',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
              'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
            ]
          });
        } else {
          toast.error('Product not found');
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const rating = 4.8;
  const reviewCount = 124;
  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleQuantityChange = (delta: number) => {
    if (isOutOfStock) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Image Gallery */}
            <div className="lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
              
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6">
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
                
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Images Available
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {product.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === idx 
                          ? 'border-indigo-500 shadow-md scale-105' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                    {product.brand}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {rating} Rating
                  </span>
                  <span className="text-sm text-gray-400">
                    ({reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-8">
                {product.discount > 0 ? (
                  <div className="flex items-end gap-4">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <span className="text-xl font-medium text-gray-400 line-through pb-1">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="prose prose-sm sm:prose text-gray-600 dark:text-gray-300 mb-8 max-w-none">
                <p className="leading-relaxed">{product.description}</p>
              </div>

              <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-8">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {isOutOfStock ? (
                      <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Out of Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> {product.stock} Units Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                  {/* Quantity Selector */}
                  <div className="flex items-center h-14 bg-gray-100 dark:bg-gray-800 rounded-full w-full sm:w-auto overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleQuantityChange(-1)} 
                      disabled={isOutOfStock || quantity <= 1}
                      className="px-4 h-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(1)} 
                      disabled={isOutOfStock || quantity >= product.stock}
                      className="px-4 h-full text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 h-14 rounded-xl font-bold text-lg"
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                    </Button>
                    <Button 
                      className="w-14 shrink-0 bg-white hover:bg-red-50 text-gray-900 hover:text-red-500 border-2 border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 h-14 rounded-xl transition-colors"
                      onClick={() => toggleWishlist(product)}
                    >
                      <Heart className={cn("w-6 h-6", isInWishlist(product.id) && "fill-red-500 text-red-500")} />
                    </Button>
                  </div>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5 mr-2" /> Buy Now
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span>Free Worldwide Shipping</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span>1 Year Warranty</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
        
        <CheckoutModal 
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          product={product}
          quantity={quantity}
          onSuccess={() => {
            setIsCheckoutModalOpen(false);
            // Locally reflect stock decrease
            setProduct((prev: any) => prev ? { ...prev, stock: prev.stock - quantity } : prev);
          }}
        />
      </div>
    </div>
  );
}
