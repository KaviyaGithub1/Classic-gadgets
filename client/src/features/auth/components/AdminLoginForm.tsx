'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const AdminLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initializeAdmin2FA = async () => {
      const token = Cookies.get('auth_token');
      const userRole = Cookies.get('user_role');
      const userName = Cookies.get('user_name');
      
      if (token && (userRole === 'ADMIN' || userName === 'Kaviya Arivarasan')) {
        setIsLoading(true);
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/admin-init-2fa`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.requires2FA) {
            setTempToken(response.data.tempToken);
            setRequires2FA(true);
            toast.success('Please enter your 2FA code');
          } else if (response.data.requires2FASetup) {
            setTempToken(response.data.tempToken);
            setQrCodeUrl(response.data.qrCodeUrl);
            setNewSecret(response.data.secret);
            setRequires2FASetup(true);
            toast.success('Admin account detected: Please set up 2FA');
          }
        } catch (error) {
          console.error('Failed to initialize admin 2FA:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAdmin2FA();
  }, []);

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email: data.email,
        password: data.password,
        isAdminPortal: true,
      });

      if (response.data.requires2FA) {
        setTempToken(response.data.tempToken);
        setRequires2FA(true);
        toast.success('Please enter your 2FA code');
        setIsLoading(false);
        return;
      }

      if (response.data.requires2FASetup) {
        setTempToken(response.data.tempToken);
        setQrCodeUrl(response.data.qrCodeUrl);
        setNewSecret(response.data.secret);
        setRequires2FASetup(true);
        toast.success('First time login: Please set up 2FA');
        setIsLoading(false);
        return;
      }

      if (response.data.user.role !== 'ADMIN') {
        toast.error('Access Denied: You do not have admin privileges.');
        setIsLoading(false);
        return;
      }

      handleLoginSuccess(response.data.token, response.data.user);

    } catch (backendError: any) {
      if (backendError.response && backendError.response.data && backendError.response.data.error) {
        toast.error(backendError.response.data.error);
      } else {
        toast.error('Authentication failed. Please check credentials or your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = requires2FASetup ? '/auth/login/setup-2fa' : '/auth/login/verify-2fa';
      const payload = requires2FASetup 
        ? { tempToken, otp, secret: newSecret }
        : { tempToken, otp };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, payload);

      if (response.data.user.role !== 'ADMIN') {
        toast.error('Access Denied: You do not have admin privileges.');
        return;
      }

      handleLoginSuccess(response.data.token, response.data.user);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Verification failed. Invalid code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, user: any) => {
    Cookies.set('auth_token', token, { expires: 1 });
    Cookies.set('user_name', user.fullName, { expires: 1 });
    Cookies.set('user_role', user.role, { expires: 1 });
    Cookies.set('admin_2fa_verified', 'true', { expires: 1 });

    toast.success('Admin authentication successful!');
    reset();
    router.push('/dashboard/admin');
  };

  if (requires2FA || requires2FASetup) {
    return (
      <form onSubmit={onVerify2FA} className="space-y-5">
        <div className="w-full text-center mb-4">
          <h3 className="text-lg font-medium text-white">
            {requires2FASetup ? 'Setup Two-Factor Authentication' : 'Two-Factor Authentication'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {requires2FASetup 
              ? 'Scan the QR code below with Google Authenticator, then enter the 6-digit code to complete setup.' 
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {requires2FASetup && qrCodeUrl && (
          <div className="flex justify-center mb-6 p-4 bg-white rounded-xl w-48 mx-auto">
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-auto" />
          </div>
        )}

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="flex h-11 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-center text-xl tracking-widest text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white" 
          isLoading={isLoading}
        >
          Verify
        </Button>
        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={() => { setRequires2FA(false); setRequires2FASetup(false); setOtp(''); }}
            className="text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Admin Email
        </label>
        <input
          type="email"
          placeholder="admin@classicgadgets.com"
          {...register('email')}
          className={cn(
            "flex h-11 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            errors.email && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>
      
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Master Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className={cn(
            "flex h-11 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            errors.password && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white" 
        isLoading={isLoading}
      >
        Authenticate
      </Button>
    </form>
  );
};
