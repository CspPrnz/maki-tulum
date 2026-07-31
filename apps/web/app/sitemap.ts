import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { listStays } from '@/content/stays';
import { listGuideTopics } from '@/content/guide';
import { SITE_URL } from '@/lib/site';

/**
 * Generated from the same content modules the pages render, so a stay or guide
 * article cannot ship without appearing here. `/book` is deliberately excluded
 * — it is still a stub, and indexing it would put an empty page in front of
 * exactly the search traffic we most want.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/stays', '/compound', '/days', '/guide'];
  const stayPaths = listStays().map((stay) => `/stays/${stay.slug}`);
  const guidePaths = listGuideTopics()
    .filter((topic) => topic.status === 'live')
    .map((topic) => `/guide/${topic.slug}`);

  const paths = [...staticPaths, ...stayPaths, ...guidePaths];

  return SUPPORTED_LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LOCALES.map((alt) => [alt, `${SITE_URL}/${alt}${path}`]),
        ),
      },
    })),
  );
}
