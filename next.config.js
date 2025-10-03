/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  reactStrictMode: true,
  
  poweredByHeader: false,
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    
    return config;
  },
  
  outputFileTracingExcludes: {
    '*': [
      'api/**/*',
    ],
  },
};

export default nextConfig;
