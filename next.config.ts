import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json exists above this project, which makes Turbopack walk
  // past the repo root. Pin it here instead.
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
