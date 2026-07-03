'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Package, ShoppingCart, Clock, Heart, ShieldCheck } from 'lucide-react';

export default function UserDashboardPage() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Retrieve simulated credentials from cookies
    const name = Cookies.get('user_name');
    const role = Cookies.get('user_role');
    if (name) {
      setUserName(name);
    }
    if (role) {
      setUserRole(role);
    }
  }, []);

  const isAdmin = userRole === 'ADMIN' || userName === 'Kaviya Arivarasan';

  const quickActions = [
    { title: 'Products', description: 'Browse our latest gadgets', icon: Package, href: '/#store', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { title: 'Cart', description: 'View your shopping cart', icon: ShoppingCart, href: '/cart', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { title: 'Orders', description: 'Track your recent orders', icon: Clock, href: '/dashboard/orders', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
    { title: 'Wishlist', description: 'See your saved items', icon: Heart, href: '/wishlist', color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userName || 'User'}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            We're glad to see you again. Check out what's new in Classic Gadgets today.
          </p>
        </div>

        {/* Admin Portal banner (Only for Admins) */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white p-8 rounded-2xl shadow-lg border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                <h2 className="text-2xl font-bold tracking-tight">Admin Portal Access</h2>
              </div>
              <p className="text-indigo-200 text-sm max-w-xl">
                You are currently logged in with Admin privileges. Click the link to complete authentication with 2FA security and enter the management area.
              </p>
            </div>
            <Link 
              href="/admin/login"
              className="px-6 py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2 whitespace-nowrap"
            >
              Go to Admin Portal
            </Link>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link 
                  href={action.href}
                  key={action.title}
                  className="block bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Profile Snapshot / Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[300px]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              No recent activity to display.
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[300px]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Status</p>
                <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified Account
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Member Since</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">July 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
