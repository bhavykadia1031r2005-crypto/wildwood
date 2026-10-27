import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Keep the dev-only Next.js badge clear of the accessibility button (bottom-left).
  devIndicators: { position: "top-right" },
  partialPrefetching: true,
  // Resolved once at build time so the footer copyright stays static.
  env: {
    BUILD_YEAR: String(new Date().getFullYear()),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // A package-lock.json in the home directory would otherwise be picked as the workspace root.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
