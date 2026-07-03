'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { X, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  brand: z.string().min(2, 'Brand is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().int().min(0, 'Stock must be an integer greater than or equal to 0'),
  discount: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'OUT_OF_STOCK']),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: any | null;
  isLoading?: boolean;
}

export const ProductModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: ProductModalProps) => {
  const isEditing = !!initialData;
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'ACTIVE',
      discount: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          category: initialData.category,
          brand: initialData.brand,
          price: initialData.price,
          stock: initialData.stock,
          discount: initialData.discount,
          status: initialData.status,
        });
        setExistingImages(initialData.images || []);
      } else {
        reset({
          name: '',
          description: '',
          category: '',
          brand: '',
          price: 0,
          stock: 0,
          discount: 0,
          status: 'ACTIVE',
        });
        setExistingImages([]);
      }
      setImageFiles([]);
    }
  }, [isOpen, initialData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray].slice(0, 5)); // Limit to 5
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    const formData = new FormData();
    
    // Append standard fields
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Append existing images JSON (so backend knows which were kept)
    if (isEditing) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // Append new files
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
                <input type="text" {...register('name')} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.name && "border-red-500")} />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Brand</label>
                <input type="text" {...register('brand')} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.brand && "border-red-500")} />
                {errors.brand && <p className="mt-1 text-xs text-red-400">{errors.brand.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <input type="text" {...register('category')} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.category && "border-red-500")} />
                {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                  <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.price && "border-red-500")} />
                  {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Stock</label>
                  <input type="number" {...register('stock', { valueAsNumber: true })} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.stock && "border-red-500")} />
                  {errors.stock && <p className="mt-1 text-xs text-red-400">{errors.stock.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Discount (%)</label>
                  <input type="number" {...register('discount', { valueAsNumber: true })} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.discount && "border-red-500")} />
                  {errors.discount && <p className="mt-1 text-xs text-red-400">{errors.discount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select {...register('status')} className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.status && "border-red-500")}>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                  {errors.status && <p className="mt-1 text-xs text-red-400">{errors.status.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-full">
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea {...register('description')} rows={4} className={cn("w-full flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", errors.description && "border-red-500")} />
                {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Images (Cloudinary)</label>
                
                <div className="relative border-2 border-dashed border-slate-600 rounded-xl bg-slate-800 p-6 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-slate-800/80 transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-400 mb-2" />
                  <p className="text-sm font-medium text-slate-300">Click or drag images to upload</p>
                  <p className="text-xs text-slate-500 mt-1">Up to 5 images</p>
                </div>

                {/* Previews */}
                {(existingImages.length > 0 || imageFiles.length > 0) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {/* Existing Images from URL */}
                    {existingImages.map((url, i) => (
                      <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                        {/* Using img instead of Next Image since domains are dynamic */}
                        <img src={url} alt="existing" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-red-500">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {/* New Uploading Images */}
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-500/50 opacity-80">
                        <img src={URL.createObjectURL(file)} alt="new" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-red-500">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white min-w-32">
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
