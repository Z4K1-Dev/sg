import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// This function protects routes that require authentication
export async function middleware(request: NextRequest) {
  // Get token from request
  const secret = process.env['NEXTAUTH_SECRET'];
  if (!secret) {
    // If no secret, don't attempt to verify token
    return NextResponse.next();
  }
  
  const token = await getToken({ 
    req: request, 
    secret: secret
  });

  // Define protected paths
  const protectedPaths = [
    '/admin',
    '/dashboard',
    '/api/admin',
    '/api/dashboard'
  ];

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access a protected path without a token, redirect to login
  if (isProtectedPath && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `callbackUrl=${request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login/register, redirect to dashboard
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register');
    
  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Define which paths should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/dashboard/:path*',
    '/login',
    '/register',
  ],
};