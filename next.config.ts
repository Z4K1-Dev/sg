import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production build optimizations
  typescript: {
    // Only ignore build errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Development server configuration
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack's hot module replacement in development
      config.watchOptions = {
        ignored: ['**/*'], // Ignore all file changes
      };
    }
    
    // Add support for CKEditor 5
    config.module.rules.push({
      test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
      use: ['raw-loader'],
    });
    
    return config;
  },
  
  // ESLint configuration
  eslint: {
    // Only ignore ESLint errors during builds in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      'framer-motion',
      'recharts',
    ],
  },
};

export default nextConfig;
