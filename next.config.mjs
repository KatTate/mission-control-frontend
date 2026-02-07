import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "*.riker.replit.dev",
  ],

  turbopack: {
    root: __projectRoot,
  },
};

export default nextConfig;
