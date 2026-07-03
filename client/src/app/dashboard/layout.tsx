'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Clock, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [is2faVerified, setIs2faVerified] = useState(false);

  useEffect(() => {
    const userRole = Cookies.get('user_role');
    const userName = Cookies.get('user_name');
    const is2fa = Cookies.get('admin_2fa_verified') === 'true';
    if (userRole === 'ADMIN' || userName === 'Kaviya Arivarasan') {
      setIsAdmin(true);
    }
    setIs2faVerified(is2fa);
  }, []);

  const handleLogout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_name');
    Cookies.remove('user_role');
    Cookies.remove('admin_2fa_verified');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/#store', icon: Package },
    { name: 'Cart', href: '/cart', icon: ShoppingCart },
    ...(isAdmin ? [
      { name: 'Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'Admin', href: is2faVerified ? '/dashboard/admin' : '/admin/login', icon: ShieldCheck }
    ] : []),
    { name: 'Orders', href: '/dashboard/orders', icon: Clock },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Classic Gadgets
          </Link>
        </div>
        
        <nav className="px-4 pb-6 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
