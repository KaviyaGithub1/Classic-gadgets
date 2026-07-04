'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const userSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  password: z.string().optional().or(z.literal('')), // Optional for edit, required manually for create
  role: z.enum(['USER', 'ADMIN']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any | null;
  isLoading?: boolean;
}

export const UserModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }: UserModalProps) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'USER'
    }
  });

  const handleGetTempEmail = async () => {
    try {
      const res = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
      const data = await res.json();
      if (data && data[0]) {
        setValue('email', data[0], { shouldValidate: true });
        toast.success(`Temp email generated: ${data[0]}`);
      }
    } catch (err) {
      const randomString = Math.random().toString(36).substring(2, 10);
      const fallbackEmail = `test_${randomString}@1secmail.com`;
      setValue('email', fallbackEmail, { shouldValidate: true });
      toast.success(`Generated fallback email: ${fallbackEmail}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          fullName: initialData.fullName,
          username: initialData.username,
          email: initialData.email,
          phone: initialData.phone || '',
          role: initialData.role,
          password: ''
        });
      } else {
        reset({
          fullName: '',
          username: '',
          email: '',
          phone: '',
          password: 'password@123',
          role: 'USER'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = (data: UserFormValues) => {
    if (!isEditing && !data.password) {
      // Manually enforce password requirement for create
      return;
    }
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.fullName && "border-red-500")}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input
              type="text"
              {...register('username')}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.username && "border-red-500")}
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGetTempEmail}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Get Temp Email
                </button>
                <span className="text-slate-600 text-xs">|</span>
                <a
                  href="https://temp-mail.org/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-300 font-medium"
                >
                  Open Temp-Mail
                </a>
              </div>
            </div>
            <input
              type="email"
              {...register('email')}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.email && "border-red-500")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.phone && "border-red-500")}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password {isEditing && <span className="text-slate-500 text-xs font-normal">(Leave blank to keep unchanged)</span>}
            </label>
            <input
              type="password"
              {...register('password')}
              required={!isEditing}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select
              {...register('role')}
              className={cn("w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500", errors.role && "border-red-500")}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
            <Button variant="outline" type="button" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white">
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
