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

  // The API sets these via Hono's secureHeaders; the web app had none at all.
  // Checked against the deployed site before adding — it was returning no
  // security headers whatsoever.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  // The old WordPress site's URLs are still in Google's index. These preserve
  // whatever ranking they built rather than dumping arrivals on a 404.
  // `permanent: true` = 301.
  async redirects() {
    return [
      { source: '/properties/maki-villa-18-1st-floor', destination: '/en/stays/villa-18', permanent: true },
      { source: '/properties/maki-villa-18-2nd-floor', destination: '/en/stays/villa-18', permanent: true },
      { source: '/properties/maki-villa-18', destination: '/en/stays/villa-18', permanent: true },
      { source: '/properties/maki-villa-19', destination: '/en/stays/villa-19', permanent: true },
      { source: '/properties/:slug*', destination: '/en/stays', permanent: true },
      { source: '/listings/:slug*', destination: '/en/stays', permanent: true },
      { source: '/area/:slug*', destination: '/en', permanent: true },
      // WordPress endpoints that no longer exist and never will. Sending these
      // to the homepage would pollute analytics with bot traffic, so they get a
      // 410 via the route handler at app/(gone)/ instead — see robots.ts.
    ];
  },
};

export default nextConfig;
