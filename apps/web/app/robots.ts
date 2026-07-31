import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * The previous WordPress site attracted heavy automated traffic. Disallowing the
 * old paths does not stop a scanner — they ignore robots.txt — but it does keep
 * legitimate crawlers from re-requesting URLs that no longer exist, and it stops
 * those dead paths being re-surfaced in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/', '/wp-login.php', '/xmlrpc.php'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
