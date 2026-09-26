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
      {
        source: "/login",
        destination: "/signin",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/ads/r001/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
