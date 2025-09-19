import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rootDomain = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : null;

    if (!rootDomain) {
      return [];
    }

    return [
      {
        source: "/:path*",
        destination: "/:path*",
        has: [
          {
            type: "host",
            value: `(?<subdomain>.*)\\.${rootDomain.replace(/\./g, "\\.")}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
