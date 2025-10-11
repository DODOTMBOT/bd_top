const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001','127.0.0.1:3001','localhost:3002','127.0.0.1:3002'],
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.cache = false; // сброс кеша при пересборке
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd()),
    }
    return config
  },
};

module.exports = nextConfig;
