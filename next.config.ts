import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Production optimization  
  reactStrictMode: false, // Disabled to prevent infinite loops in development
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  
  // Build optimization
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'], // Only lint src directory, exclude oldapp
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Exclude oldapp directory from builds
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external images for Vercel deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Runtime configuration for Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude edge functions and oldapp from Next.js build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      os: false,
    };
    
    // Exclude oldapp directory
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /oldapp/,
    });
    
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Output configuration for better Vercel compatibility
  output: 'standalone',
};

export default withBundleAnalyzer(nextConfig);
