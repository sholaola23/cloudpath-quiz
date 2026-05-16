import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — the site is hosted on Cloudflare Pages.
  // Dynamic endpoints (/api/subscribe, /api/generate-result) run as
  // Cloudflare Pages Functions in `functions/api/*`, NOT as Next API
  // routes (those are inert under static export).
  output: "export",
};

export default nextConfig;
