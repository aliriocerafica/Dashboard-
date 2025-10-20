import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Add this line
  images: {
    unoptimized: true,
  },
};

export default nextConfig;