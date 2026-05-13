import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages via @opennextjs/cloudflare
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
