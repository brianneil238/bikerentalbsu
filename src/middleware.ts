import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Role-based access control for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Allow unauthenticated access to auth pages
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          // If user is already logged in, redirect away from auth pages
          if (token) {
            return false; // This will trigger redirect to '/'
          }
          return true; // Allow access for unauthenticated users
        }

        // For any other page, user must be authenticated
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
      // If an authorized callback returns false, user is redirected to the home page
      error: '/', 
    },
  }
);

export const config = {
  // Apply middleware to all routes except static assets and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 