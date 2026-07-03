'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Shield, ShieldAlert, ShieldCheck, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  // Setup State
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const token = Cookies.get('auth_token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FAEnabled(response.data.isTwoFactorEnabled || false);
    } catch (error) {
      console.error('Failed to fetch profile settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecretKey(response.data.secret);
      setIsSettingUp(true);
    } catch (error) {
      toast.error('Failed to generate 2FA credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/enable`, {
        secret: secretKey,
        token: otpCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIs2FAEnabled(true);
      setIsSettingUp(false);
      setOtpCode('');
      toast.success('Two-Factor Authentication enabled successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/disable`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIs2FAEnabled(false);
      toast.success('Two-Factor Authentication disabled.');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isSettingUp && !is2FAEnabled && secretKey === '') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Security Settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your administrative security preferences and two-factor authentication.
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Two-Factor Authentication (2FA)</h2>
          </div>
          <p className="text-sm text-slate-400 ml-8">
            Add an extra layer of security to your admin account by requiring a verification code in addition to your password.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* State 1: 2FA is already enabled */}
          {is2FAEnabled && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-400 text-lg">2FA is Enabled</h3>
                  <p className="text-sm text-slate-300 mt-1">Your account is highly secure.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
              >
                Disable 2FA
              </Button>
            </div>
          )}

          {/* State 2: 2FA is disabled and NOT setting up */}
          {!is2FAEnabled && !isSettingUp && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg border border-amber-500/20 bg-amber-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-400 text-lg">2FA is Not Configured</h3>
                  <p className="text-sm text-slate-300 mt-1">Protect your account from unauthorized access.</p>
                </div>
              </div>
              <Button 
                onClick={handleGenerate2FA}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
              >
                Set up 2FA
              </Button>
            </div>
          )}

          {/* State 3: 2FA Setup Wizard */}
          {!is2FAEnabled && isSettingUp && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-400" /> Complete Setup
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Step 1: Scan */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">1. Scan the QR Code</h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Open Google Authenticator or Authy and scan this code.
                    </p>
                    <div className="bg-white p-3 rounded-lg inline-block shadow-lg">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-500">Generating...</div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-1">Or enter this setup key manually:</p>
                      <code className="px-3 py-1.5 bg-slate-800 rounded text-blue-400 text-xs font-mono select-all">
                        {secretKey}
                      </code>
                    </div>
                  </div>

                  {/* Step 2: Verify */}
                  <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">2. Enter Verification Code</h4>
                    <p className="text-sm text-slate-400 mb-6">
                      Enter the 6-digit code generated by your app to verify the setup.
                    </p>
                    <form onSubmit={handleEnable2FA} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="flex h-12 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          type="submit" 
                          disabled={isLoading || otpCode.length !== 6}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          Verify & Enable
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => { setIsSettingUp(false); setOtpCode(''); }}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
