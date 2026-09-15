/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        // match any path under /uploads/
        pathname: "/uploads/:path*",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        // match any path
        pathname: "/:path*",
      },
    ],
  },
};

export default nextConfig;
