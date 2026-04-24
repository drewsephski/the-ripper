/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: ["localhost:3000", "the-ripper-omega.vercel.app"],
        allowedForwardedHosts: ["localhost:3000", "the-ripper-omega.vercel.app"],
      },
    },
  };
  
export default nextConfig;