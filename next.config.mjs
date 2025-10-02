import path from 'node:path';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['page.jsx', 'page.js', 'page.tsx', 'page.ts'],
  experimental: {
    typedRoutes: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    return config;
  },
};

export default nextConfig;
