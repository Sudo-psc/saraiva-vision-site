/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['saraivavision.com.br', '31.97.129.78'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://31.97.129.78:3001',
    NEXT_PUBLIC_CLINIC_URL: process.env.NEXT_PUBLIC_CLINIC_URL || 'https://saraivavision.com.br/agendamento',
  },
  experimental: {
    optimizeCss: false,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;