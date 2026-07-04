'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import {
  MapPin, CreditCard, ShieldCheck, Truck, CheckCircle2,
  ArrowLeft, ChevronRight, Package
} from 'lucide-react';

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartSubtotal, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [address, setAddress] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '', upiId: '' });

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24" />;

  const tax = cartSubtotal * 0.08;
  const shipping = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 50;
  const total = cartSubtotal + tax + shipping;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsPlacing(false);
    setIsSuccess(true);
    clearCart();
  };

  // ── Success Screen ───────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce-once">
          <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">Thank you, <strong>{address.fullName || 'Customer'}</strong>!</p>
        <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-sm">
          Your order has been confirmed and will be delivered to <strong>{address.city || 'your address'}</strong> within 3–5 business days.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/dashboard/orders">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-full h-12 font-bold">
              <Package className="w-4 h-4 mr-2" /> Track Orders
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white px-8 rounded-full h-12 font-bold hover:bg-gray-50">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty Cart Guard ─────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h1>
        <Link href="/"><Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-full mt-2">Shop Now</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${i <= step ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}
                onClick={() => i < step && setStep(i)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step ? 'bg-indigo-600 border-indigo-600 text-white' :
                  i === step ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' :
                  'border-gray-300 dark:border-gray-700 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm font-semibold hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT: Step Content ── */}
          <div className="flex-1">

            {/* STEP 0: Delivery Address */}
            {step === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', placeholder: 'Enter your full name', col: 2 },
                    { label: 'Phone Number', key: 'phone', placeholder: '+91 XXXXX XXXXX', col: 1 },
                    { label: 'Country', key: 'country', placeholder: 'India', col: 1 },
                    { label: 'Address Line', key: 'addressLine', placeholder: 'House No, Street, Area', col: 2 },
                    { label: 'City', key: 'city', placeholder: 'Enter city', col: 1 },
                    { label: 'State', key: 'state', placeholder: 'Enter state', col: 1 },
                    { label: 'PIN Code', key: 'pincode', placeholder: '6-digit PIN', col: 1 },
                  ].map(({ label, key, placeholder, col }) => (
                    <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={(address as any)[key]}
                        onChange={e => setAddress({ ...address, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-6 w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                  onClick={() => {
                    if (!address.fullName || !address.addressLine || !address.city || !address.pincode) {
                      toast.error('Please fill in all required fields'); return;
                    }
                    setStep(1);
                  }}
                >
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                    { id: 'upi', label: 'UPI', icon: '📱' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '🏠' },
                  ].map(({ id, label, icon }) => (
                    <button
                      key={id}
                      onClick={() => setPayment({ ...payment, method: id })}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-sm font-semibold ${
                        payment.method === id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-xs text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Card Fields */}
                {payment.method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={payment.cardNumber}
                        onChange={e => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={payment.expiry}
                          onChange={e => setPayment({ ...payment, expiry: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={payment.cvv}
                          onChange={e => setPayment({ ...payment, cvv: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Field */}
                {payment.method === 'upi' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={payment.upiId}
                      onChange={e => setPayment({ ...payment, upiId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {payment.method === 'cod' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-medium">
                    💵 You will pay <strong>₹{total.toFixed(2)}</strong> in cash when the order is delivered to your address.
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep(0)}
                    className="flex-1 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                    onClick={() => setStep(2)}
                  >
                    Review Order <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Delivery summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-indigo-600" /> Delivery Address
                    </div>
                    <button onClick={() => setStep(0)} className="text-xs text-indigo-600 hover:underline font-semibold">Edit</button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{address.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{address.addressLine}, {address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{address.phone}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                      <CreditCard className="w-4 h-4 text-indigo-600" /> Payment
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline font-semibold">Edit</button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.method === 'card' && `💳 Card ending in ${payment.cardNumber.slice(-4) || '****'}`}
                    {payment.method === 'upi' && `📱 UPI — ${payment.upiId || 'ID not entered'}`}
                    {payment.method === 'cod' && '🏠 Cash on Delivery'}
                  </p>
                </div>

                {/* Items summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" /> Items ({items.length})
                  </h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">?</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    {isPlacing ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</span>
                    ) : (
                      <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Place Order</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-900 dark:text-white">₹{cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax (8%)</span><span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-medium text-emerald-500">{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Payments</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><Truck className="w-4 h-4 text-indigo-500" /> Free delivery above ₹500</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Easy 30-day returns</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
