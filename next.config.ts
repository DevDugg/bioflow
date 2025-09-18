import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<subdomain>.*)\\.bioflow\\.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
