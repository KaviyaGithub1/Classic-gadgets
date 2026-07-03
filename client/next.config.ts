import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't fail the Vercel build on TS errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
  },
};

export default nextConfig;
