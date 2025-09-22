/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for migration


  // Image optimization settings
  images: {
    domains: [
      'saraivavision.com.br',
      'www.saraivavision.com.br',
      'localhost',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://saraivavision.com.br',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        // Apply to all routes
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // API routes headers
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://saraivavision.com.br'
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        // Static assets caching
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images caching
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects (migrate from vercel.json)
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services/:path*',
        destination: '/servicos/:path*',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/contato',
        permanent: true,
      },
      {
        source: '/testimonials',
        destination: '/depoimentos',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacidade',
        permanent: true,
      },
      {
        source: '/podcast',
        destination: '/podcast',
        permanent: true,
      },
    ];
  },

  // WordPress API integration rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://saraivavision.com.br/wp-json/:path*',
      },
    ];
  },

  // Webpack configuration for migration compatibility
  webpack: (config) => {
    // Handle any special webpack needs during migration

    // Support for importing markdown files (if needed)
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },

  // Bundle analyzer (conditionally enabled)
  ...(process.env.ANALYZE === 'true' && {
    // Add bundle analyzer if needed
  }),

  // Output configuration
  output: 'standalone',

  // Compression
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,
};

export default nextConfig;