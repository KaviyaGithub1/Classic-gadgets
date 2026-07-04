'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  ShieldCheck,
  LogOut,
  Package,
  Users,
  ShoppingCart,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const sidebarLinks = [
  { name: 'Products', href: '/dashboard/admin/products', icon: Package },
  { name: 'Cart', href: '/cart', icon: ShoppingCart },
  { name: 'Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'Admin', href: '/dashboard/admin/analytics', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    const role = Cookies.get('user_role');
    const is2faVerified = Cookies.get('admin_2fa_verified');

    if (!token || role !== 'ADMIN' || is2faVerified !== 'true') {
      toast.error('Access Denied: 2FA authentication required');
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_name');
    Cookies.remove('user_role');
    Cookies.remove('admin_2fa_verified');
    toast.success('Admin logged out successfully');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-white">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <Link href="/dashboard/admin/analytics" className="text-xl font-bold text-white tracking-wider">
            ADMIN
          </Link>
        </div>

        <nav className="px-4 pb-6 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:bg-blue-600/25 hover:text-blue-300"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 overflow-x-hidden p-8">
        {isAuthorized ? children : (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        )}
      </main>
    </div>
  );
}
