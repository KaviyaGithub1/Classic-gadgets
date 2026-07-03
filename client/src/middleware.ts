import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  // Protect /dashboard/admin routes (Only ADMIN)
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect /dashboard routes (Only USER or ADMIN)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Prevent logged-in users from going to /login, /register, or /admin/login
  if (
    request.nextUrl.pathname === '/login' || 
    request.nextUrl.pathname === '/register' ||
    request.nextUrl.pathname === '/admin/login'
  ) {
    if (token) {
      if (role === 'ADMIN') {
        const is2faVerified = request.cookies.get('admin_2fa_verified')?.value === 'true';
        if (is2faVerified) {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        }
        if (request.nextUrl.pathname === '/admin/login') {
          return NextResponse.next();
        }
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/admin/:path*'],
};
