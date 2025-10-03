import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Define role-based access for different paths
const roleAccess = {
  '/admin': ['ADMIN'],
  '/admin/': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/users/': ['ADMIN'],
  '/api/admin': ['ADMIN'],
  '/api/admin/': ['ADMIN'],
  '/dashboard': ['USER', 'OPERATOR', 'ADMIN'], // All authenticated users can access dashboard
  '/dashboard/': ['USER', 'OPERATOR', 'ADMIN'],
  '/api/dashboard': ['USER', 'OPERATOR', 'ADMIN'],
  '/api/dashboard/': ['USER', 'OPERATOR', 'ADMIN'],
};

// This function protects routes that require authentication and authorization
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

  // Check if this path requires authentication
  const requiresAuth = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/api/admin') ||
    request.nextUrl.pathname.startsWith('/api/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile');
  
  // If trying to access a protected path without a token, redirect to login
  if (requiresAuth && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `callbackUrl=${request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  // Check if this path requires specific role authorization
  const pathname = request.nextUrl.pathname;
  let requiredRoles: string[] | undefined;
  
  // Check exact path first
  if (pathname in roleAccess) {
    requiredRoles = (roleAccess as Record<string, string[]>)[pathname];
  } else {
    // Check partial paths
    const pathParts = pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length >= 1) {
      const path1 = `/${pathParts[0]}`;
      if (path1 in roleAccess) {
        requiredRoles = (roleAccess as Record<string, string[]>)[path1];
      }
    }
    if (!requiredRoles && pathParts.length >= 2) {
      const path2 = `/${pathParts[0]}/${pathParts[1]}`;
      if (path2 in roleAccess) {
        requiredRoles = (roleAccess as Record<string, string[]>)[path2];
      }
    }
    if (!requiredRoles && pathParts.length >= 3) {
      const path3 = `/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}`;
      if (path3 in roleAccess) {
        requiredRoles = (roleAccess as Record<string, string[]>)[path3];
      }
    }
  }

  if (requiredRoles && token) {
    const userRole = token['role'] || 'USER';
    if (!requiredRoles.includes(userRole)) {
      // User doesn't have required role, redirect to unauthorized page
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/unauthorized',
  ],
};