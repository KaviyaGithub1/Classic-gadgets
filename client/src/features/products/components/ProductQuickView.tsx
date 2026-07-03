import React from 'react';
import { X, ShoppingCart, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const ProductQuickView = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
  const { addToCart } = useCart();
  const router = useRouter();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, 1);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative border border-gray-200/50 dark:border-gray-800/50"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/30 p-8 flex items-center justify-center min-h-[300px]">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal"
            />
          ) : (
            <div className="text-gray-400 font-medium">No Image</div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="text-[11px] font-bold tracking-widest text-indigo-500 uppercase mb-3">
            {product.brand}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2.5 py-1 rounded-md">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">4.8</span>
            </div>
            <span className="text-sm text-gray-500">(124 reviews)</span>
          </div>

          <div className="mb-8">
            {product.discount > 0 ? (
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  ₹{((product.price * (1 - product.discount / 100))).toLocaleString()}
                </span>
                <span className="text-lg text-gray-400 line-through decoration-gray-300 font-medium mb-1">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md mb-2">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <p className="text-sm text-emerald-500 font-semibold mt-2 uppercase tracking-wider">
              {product.stock > 0 ? 'In Stock & Ready to Ship' : 'Out of Stock'}
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 flex-1">
            Experience the next level of innovation with the {product.name}. Designed with precision and engineered for excellence, it offers unmatched performance and style for the modern world.
          </p>

          <div className="flex flex-col gap-3 mt-auto">
            <Button 
              className="w-full h-14 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
            >
              <Zap className="w-5 h-5 mr-2" /> Buy Now
            </Button>
            <Button 
              variant="outline"
              className="w-full h-14 rounded-xl border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
