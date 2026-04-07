import type { NextConfig } from "next";

const nextConfig: NextConfig & {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
} = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  }
};

export default nextConfig;