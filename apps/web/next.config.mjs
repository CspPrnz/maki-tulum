/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
  // NEXT_PUBLIC_* vars are inlined at build time. Pass as Docker build args
  // (Railway: "build variables"), never as runtime env. Lesson from Civion Safe.
};

export default nextConfig;
