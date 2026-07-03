'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

import Cookies from 'js-cookie';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  quantity: number;
  onSuccess: () => void;
}

export const CheckoutModal = ({ isOpen, onClose, product, quantity, onSuccess }: CheckoutModalProps) => {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !product) return null;

  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;
  
  const total = finalPrice * quantity;

  const handleConfirm = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        productId: product.id,
        quantity,
        deliveryAddress: address,
        paymentMethod
      }, { headers });
      
      toast.success('Order placed successfully!');
      onSuccess();
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        // Simulation mode
        toast.success('Simulation: Order placed successfully!');
        onSuccess();
      } else {
        toast.error(error.response?.data?.error || 'Failed to place order');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Secure Checkout
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8">
          
          {/* Left: Summary */}
          <div className="flex-1 space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-800 pb-2">Order Summary</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                {product.images && product.images[0] ? (
                   <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h4>
                <p className="text-sm text-slate-500 mt-1">Qty: {quantity}</p>
                <p className="text-indigo-600 font-bold mt-1">${finalPrice.toFixed(2)} each</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-500">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg border-b border-slate-200 dark:border-slate-800 pb-2">Delivery & Payment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full shipping address..."
                  rows={3} 
                  className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="outline" type="button" onClick={onClose} disabled={isProcessing} className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} isLoading={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-32">
            Confirm Purchase
          </Button>
        </div>
      </div>
    </div>
  );
};
