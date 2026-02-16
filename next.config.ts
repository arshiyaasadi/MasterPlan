import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid React Client Manifest / SegmentViewNode errors in dev (Next.js devtools bug)
  devIndicators: false,
};

export default nextConfig;
