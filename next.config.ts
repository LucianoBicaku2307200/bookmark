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


const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Export configuration based on environment to avoid Turbopack/Webpack conflicts in Dev
export default process.env.NODE_ENV === "development" ? nextConfig : withPWA(nextConfig);

