/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: ["demo.exa.ai", "localhost:3000"],
        allowedForwardedHosts: ["localhost:3000"],
      },
    },
  };
  
export default nextConfig;