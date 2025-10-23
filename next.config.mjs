/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Set this to a size that accommodates your largest file
    },
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
