import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — the parent Workspace/ directory has unrelated
  // projects with their own lockfiles, which Next.js would otherwise guess at.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
