import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.worldofwarcraft.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.battle.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.blizzard.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "assets.rpglogs.com",
        pathname: "/img/warcraft/**",
      },
    ],
  },
};

export default nextConfig;
