'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ShoppingBag, FileText, X, Printer, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get('auth_token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK') {
          // Simulation data
          setOrders([
            {
              id: 'ord-12345-abcde',
              createdAt: new Date().toISOString(),
              status: 'SHIPPED',
              quantity: 1,
              totalPrice: 299.99,
              deliveryAddress: '123 Tech Lane, Silicon Valley, CA 94025',
              paymentMethod: 'CREDIT_CARD',
              product: {
                name: 'Premium Wireless Headphones',
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'],
              }
            },
            {
              id: 'ord-67890-fghij',
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
              status: 'DELIVERED',
              quantity: 2,
              totalPrice: 259.00,
              deliveryAddress: '456 Gadget Blvd, New York, NY 10001',
              paymentMethod: 'PAYPAL',
              product: {
                name: 'Mechanical Gaming Keyboard',
                images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80'],
              }
            }
          ]);
        } else {
          toast.error('Failed to load order history');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">Processing</span>;
      case 'SHIPPED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">Shipped</span>;
      case 'DELIVERED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Delivered</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">Cancelled</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500">{status}</span>;
    }
  };

  const getPaymentName = (method: string) => {
    if (method === 'CREDIT_CARD') return 'Credit Card';
    if (method === 'PAYPAL') return 'PayPal';
    if (method === 'CASH_ON_DELIVERY') return 'Cash on Delivery';
    return method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your past purchases.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Order Details</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-gray-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    You haven't placed any orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
                          {order.product.images?.[0] ? (
                            <img src={order.product.images[0]} alt="Product" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                            {order.product.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 font-mono">
                            ID: {order.id.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Qty: {order.quantity}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedInvoice(order)}
                        className="text-xs h-8 px-3 gap-1.5 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        <FileText className="w-3.5 h-3.5" /> Invoice
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 text-gray-900">
            
            {/* Invoice Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-indigo-600 tracking-tight">CLASSIC GADGETS</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wider">OFFICIAL RECEIPT</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 bg-white rounded-full shadow-sm border border-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Order Date</p>
                  <p className="text-sm font-bold">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedInvoice.id}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Item Summary</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {selectedInvoice.product.images?.[0] && (
                      <img src={selectedInvoice.product.images[0]} alt="Product" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-2">{selectedInvoice.product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Quantity: {selectedInvoice.quantity}</p>
                  </div>
                  <div className="text-right font-bold text-sm">
                    ${selectedInvoice.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Delivery Address
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{selectedInvoice.deliveryAddress}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Method
                  </div>
                  <p className="text-sm font-bold mt-auto pb-1">{getPaymentName(selectedInvoice.paymentMethod)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300">
                <span className="font-bold text-gray-500">Total Paid</span>
                <span className="text-2xl font-black text-gray-900">${selectedInvoice.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400 font-medium">Thank you for your business!</p>
              <Button onClick={() => window.print()} variant="outline" className="text-xs h-8 gap-2 bg-white border-gray-200 shadow-sm hover:bg-gray-100 text-gray-700">
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
