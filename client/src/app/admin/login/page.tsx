import Link from 'next/link';
import { AdminLoginForm } from '@/features/auth/components/AdminLoginForm';

export const metadata = {
  title: 'Admin Portal - Classic Gadgets',
  description: 'Secure Admin Login.',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Secure access restricted to authorized personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-slate-700">
          <AdminLoginForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-slate-400">
                  Not an admin?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Return to User Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
