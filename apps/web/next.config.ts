import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@arukah/contracts", "@arukah/domain", "@arukah/ui"]
};

export default nextConfig;
