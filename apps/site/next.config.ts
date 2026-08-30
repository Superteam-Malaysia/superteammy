import type { NextConfig } from "next";

/** Borneo app upstream — private Railway hostname in prod, local dev server otherwise. */
function borneoUpstream(): string {
  const raw =
    process.env.BORNEO_UPSTREAM?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "http://web.railway.internal:8080"
      : "http://127.0.0.1:3001");
  return raw.replace(/\/$/, "");
}

const nextConfig: NextConfig = {
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
  async rewrites() {
    const upstream = borneoUpstream();
    return {
      beforeFiles: [
        { source: "/borneo", destination: `${upstream}/borneo` },
        { source: "/borneo/:path*", destination: `${upstream}/borneo/:path*` },
      ],
    };
  },
};

export default nextConfig;
