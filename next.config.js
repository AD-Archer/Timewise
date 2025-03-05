/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Only if you want to ignore ESLint during builds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.scdn.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '**',
      },
      // Allow any image domain (use with caution in production)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      }
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
}

module.exports = nextConfig 