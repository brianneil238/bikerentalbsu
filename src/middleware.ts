import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user is authenticated
  if (token) {
    // If they are on an auth page, redirect them to the home page
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Handle admin role access
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } 
  // If the user is not authenticated
  else {
    // And they are not on an auth page, redirect them to the login page
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Match all paths except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 