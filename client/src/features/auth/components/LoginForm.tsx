'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          email: data.email,
          password: data.password,
        });

        Cookies.set('auth_token', response.data.token, { expires: 7 });
        Cookies.set('user_name', response.data.user.fullName, { expires: 7 });
        Cookies.set('user_role', response.data.user.role, { expires: 7 });
        
        toast.success(response.data.message || 'Logged in successfully!');
        reset();
        
        // Redirect all successful logins to the dashboard home page
        router.push('/dashboard');
      } catch (backendError: any) {
        throw backendError;
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-700 dark:bg-gray-900"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700 dark:text-gray-300">
            Remember Me
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Forgot Password?
          </a>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        isLoading={isLoading}
      >
        Login
      </Button>
    </form>
  );
};
