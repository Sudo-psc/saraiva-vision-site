/** @type {import('next').NextConfig} */
const nextConfig = {
  // React and Next.js settings
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'saraivavision.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.saraivavision.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yluhrvsqdohxcnwwrekz.supabase.co',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [480, 768, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects configuration
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'profile',
            value: '(?<profile>familiar|jovem|senior)',
          },
        ],
        destination: '/:profile',
        permanent: false,
      },
    ];
  },

  // Experimental features
  experimental: {
    // Enable optimizeCss for production builds
    optimizeCss: true,
    // Enable middleware
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }

    // Handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // TypeScript configuration
  typescript: {
    // Allow production builds even with TypeScript errors (for gradual migration)
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Allow production builds even with ESLint errors (for gradual migration)
    ignoreDuringBuilds: false,
  },

  // Output configuration for VPS deployment
  output: 'standalone',

  // Trailing slash configuration
  trailingSlash: false,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Production source maps (disabled for smaller builds)
  productionBrowserSourceMaps: false,

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,
};

module.exports = nextConfig;
