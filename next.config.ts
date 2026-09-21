import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/journal/overmind",
        destination: "/overmind/journal",
        permanent: true,
      },
      {
        source: "/journal/overmind/:path*",
        destination: "/overmind/journal/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
