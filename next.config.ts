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

export default withPWA(nextConfig);

