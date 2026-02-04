import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "*.riker.replit.dev",
  ],

  // Prevent Next from guessing the repo root when multiple lockfiles exist.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
