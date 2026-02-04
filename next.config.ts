import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/**",
      },
      {
        protocol: "https",
        hostname: "books.googleusercontent.com",
        pathname: "/books/content/**",
      },
    ],
  },
};

export default nextConfig;
