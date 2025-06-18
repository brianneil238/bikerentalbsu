import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // If authenticated user tries to access login/register, redirect to dashboard
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                       req.nextUrl.pathname.startsWith('/register');
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Role-based access control for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Continue to the requested page
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback is for NextAuth.js to determine if a user is authorized for a matched route.
      // We want to apply authentication to all routes in 'matcher'.
      // If unauthorized, NextAuth.js will redirect to `pages.signIn`.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login', // Specify the login page for NextAuth.js to redirect to
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*', // Protected routes that require authentication
    '/admin/:path*',
    // Temporarily removing /rent protection to debug
    // '/rent/:path*',
    // IMPORTANT: Do NOT include '/login' or '/register' here.
    // NextAuth.js handles redirects to 'signIn' page automatically if 'authorized' callback returns false.
  ],
}; 