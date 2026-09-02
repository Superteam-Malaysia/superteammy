import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same wifi load the dev server. Next blocks cross-origin
  // dev resources (HMR and friends) by default; this has no effect on a
  // production build. Add your own LAN IP if it differs.
  allowedDevOrigins: ["192.168.100.18", "*.local"],
  async redirects() {
    return [{ source: "/borneo/venue", destination: "/borneo/travel", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.lumacdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Member avatars imported from the community sheet point at X/Twitter's
        // CDN. next/image rejects unconfigured hosts at runtime.
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
