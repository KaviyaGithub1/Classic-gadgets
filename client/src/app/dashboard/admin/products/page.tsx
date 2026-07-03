'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import { ProductModal } from '@/features/products/components/ProductModal';
import { cn } from '@/lib/utils';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const url = searchQuery 
        ? `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(searchQuery)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;
        
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        // Fallback mock data if DB is down
        setProducts([
          { 
            id: '1', name: 'Premium Wireless Headphones', brand: 'AudioTech', category: 'Electronics', 
            price: 299.99, stock: 45, discount: 10, status: 'ACTIVE', images: [] 
          },
          { 
            id: '2', name: 'Mechanical Gaming Keyboard', brand: 'KeyMaster', category: 'Accessories', 
            price: 129.50, stock: 0, discount: 0, status: 'OUT_OF_STOCK', images: [] 
          },
        ]);
        toast.error('Database connection failed. Showing mock data.');
      } else {
        toast.error('Failed to load products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleOpenModal = (product?: any) => {
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const token = Cookies.get('auth_token');
      // Must use multipart/form-data for file uploads
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      if (selectedProduct) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${selectedProduct.id}`, formData, { headers });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, formData, { headers });
        toast.success('Product created successfully');
      }
      
      handleCloseModal();
      fetchProducts(search);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot save product while offline/database is down.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save product');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    
    try {
      const token = Cookies.get('auth_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Active</span>;
      case 'DRAFT': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">Draft</span>;
      case 'OUT_OF_STOCK': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Out of Stock</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-500" /> Products Inventory
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
          <button 
            type="button" 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-12">Image</th>
                <th className="px-6 py-4 font-semibold">Product Details</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-700 border-dashed">
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-medium text-white truncate">{product.name}</div>
                      <div className="text-xs text-slate-500 flex gap-2 mt-1">
                        <span>{product.brand}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">${product.price.toFixed(2)}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-emerald-400">{product.discount}% OFF</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn("font-medium", product.stock === 0 ? "text-red-400" : "text-white")}>
                        {product.stock} units
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors bg-slate-900/50 rounded-md"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors bg-slate-900/50 rounded-md"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveProduct}
        initialData={selectedProduct}
        isLoading={isSaving}
      />
    </div>
  );
}
