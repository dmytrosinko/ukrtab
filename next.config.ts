import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prom.ua",
      },
      {
        protocol: "https",
        hostname: "**.prom.ua",
      },
    ],
  },
};

export default nextConfig;
