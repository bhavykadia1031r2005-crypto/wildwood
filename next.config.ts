import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The dev-only Next.js badge would sit on the nav, accessibility or chat buttons in any
  // corner. Hidden; compile and runtime errors still show in the error overlay.
  devIndicators: false,
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
