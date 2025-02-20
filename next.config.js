/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Only if you want to ignore ESLint during builds
  },
  images: {
    domains: [], // Add any external image domains here if needed
  },
}

module.exports = nextConfig 