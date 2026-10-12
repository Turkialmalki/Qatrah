import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Provider uploads live in the public `service-images` Storage bucket.
      { protocol: "https", hostname: "*.supabase.co" },
      // Stock photography used only by the demo seed data.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
