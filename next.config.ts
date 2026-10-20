import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows an isolated build directory when a local preview is running.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
