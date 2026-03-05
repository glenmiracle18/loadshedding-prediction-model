import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tcjrhk37ew.ufs.sh',
        port: '',
        pathname: '/f/**',
      },
    ],
  },
  // Allow external video sources
  experimental: {
    // Enable if needed for video optimization
  },
};

export default nextConfig;
