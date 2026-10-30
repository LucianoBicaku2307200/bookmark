import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
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
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    // Replaces the default "apis" rule: per-user API responses must not outlive sign-out in Cache Storage.
    runtimeCaching: [
      {
        urlPattern: ({ sameOrigin, url: { pathname } }: { sameOrigin: boolean; url: URL }) =>
          sameOrigin && pathname.startsWith("/api/"),
        handler: "NetworkOnly",
        options: { cacheName: "apis" },
      },
    ],
  },
});

// Export configuration based on environment to avoid Turbopack/Webpack conflicts in Dev
export default process.env.NODE_ENV === "development" ? nextConfig : withPWA(nextConfig);

