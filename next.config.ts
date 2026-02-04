import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     remotePatterns: [
      {
        protocol: 'https', // Only allows images from HTTPS URLs
        hostname: '**', // Wildcard to match any hostname
        port: '',
        pathname: '/**', // Wildcard to match any path
      },
    ],
  },
};

export default nextConfig;

