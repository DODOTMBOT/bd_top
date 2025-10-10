import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ВАЖНО: никакого output: "export"
  // output: "export", // УДАЛИТЬ эту строку, если есть
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  webpack: (config) => {
    config.cache = false; // сброс кеша при пересборке
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd()),
    }
    return config
  },
}

export default nextConfig


