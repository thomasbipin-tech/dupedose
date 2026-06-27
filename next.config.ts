import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow real product images from retailer CDNs + Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "www.sephora.com" },
      { protocol: "https", hostname: "media.ulta.com" },
      { protocol: "https", hostname: "target.scene7.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
