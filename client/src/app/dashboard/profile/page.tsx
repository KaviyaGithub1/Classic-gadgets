'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Camera, User, Lock, Mail, Phone, Hash, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Detect likely gender from name and return a matching avatar URL
function getDefaultAvatar(name: string): string {
  const firstName = name.trim().split(' ')[0].toLowerCase();
  // Common female name endings / patterns
  const femalePatterns = [
    /a$/, /ia$/, /ina$/, /ita$/, /elle$/, /ette$/, /ine$/, /een$/, /leen$/, /iya$/, /ya$/, /ie$/,
  ];
  const femaleNames = [
    'kaviya','priya','ananya','divya','meera','sneha','pooja','nisha','lakshmi','radha',
    'anjali','deepa','sita','geeta','rekha','usha','nita','ritu','sunita','smita',
    'mary','sara','sarah','emily','emma','olivia','sophia','isabella','ava','mia',
    'amelia','harper','evelyn','abigail','ella','scarlett','grace','chloe','luna',
    'jessica','ashley','amanda','melissa','stephanie','jennifer','elizabeth','hannah',
    'fatima','aisha','zainab','nour','yasmin','hana','layla','maya','lena',
  ];
  const isFemale = femaleNames.includes(firstName) || femalePatterns.some(p => p.test(firstName));
  const seed = encodeURIComponent(name || 'user');
  if (isFemale) {
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&gender=female&backgroundColor=b6e3f4`;
  }
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&gender=male&backgroundColor=c0aede`;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get('auth_token');

  // Profile State
  const [profile, setProfile] = useState({
    id: '',
    fullName: '',
    username: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // Password State
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Image Preview State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setImagePreview(response.data.avatar || null);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        // Simulation Data
        const mockData = {
          id: 'usr_123',
          fullName: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+1 234 567 8900',
          avatar: '',
        };
        setProfile(mockData);
        setImagePreview(null);
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('phone', profile.phone);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Profile updated successfully!');
      // Update local storage if needed by other components, though mostly we rely on backend
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        toast.success('(Simulation) Profile updated successfully!');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Password updated successfully!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        toast.success('(Simulation) Password updated successfully!');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(error.response?.data?.error || 'Failed to update password');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your account details, profile picture, and security settings.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'general' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> General Info
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'security' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Security
            </div>
          </button>
        </div>

        <div className="p-6 sm:p-10">
          
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile}>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                {/* Avatar Upload */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative z-10">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={getDefaultAvatar(profile.fullName)} 
                        alt={profile.fullName || 'Profile'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div 
                      onClick={handleImageClick}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                    >
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs text-white font-medium">Update</span>
                    </div>
                  </div>
                  
                  {/* Decorative background ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 scale-[1.15] z-0 pointer-events-none"></div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your photo and personal details here.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Read Only Fields */}
                <div className="opacity-70">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-xs text-indigo-500 ml-1">(Read Only)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="opacity-70">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-xs text-indigo-500 ml-1">(Read Only)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 rounded-xl font-medium shadow-lg shadow-indigo-500/30"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" /> Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="max-w-xl">
              
              <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500">Secure your account</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-600 mt-1">Ensure your new password is at least 6 characters long and includes a mix of letters and numbers.</p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="Create a new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-start pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 px-8 py-6 rounded-xl font-medium"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
