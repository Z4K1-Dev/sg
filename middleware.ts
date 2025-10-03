import { NextRequest, NextResponse } from 'next/server';

// Define allowed origins (adjust as needed)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];

export function middleware(request: NextRequest) {
  // CORS headers
  const origin = request.headers.get('origin');
  const isOriginAllowed = !origin || allowedOrigins.includes(origin);
  
  const response = NextResponse.next();

  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Basic XSS protection
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Control referrer information
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // HSTS
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};