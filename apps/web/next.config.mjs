/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
  // Transpile workspace packages whose source ships as .ts(x).
  // Without this, webpack can't resolve `./components/Foo` to a .tsx file
  // inside @maki/ui — leading to "Module not found" at build time.
  transpilePackages: ['@maki/ui', '@maki/i18n', '@maki/types', '@maki/config'],
  // NEXT_PUBLIC_* vars are inlined at build time. Pass as Docker build args
  // (Railway: "build variables"), never as runtime env. Lesson from Civion Safe.
};

export default nextConfig;
