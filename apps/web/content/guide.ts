/**
 * Guide topic index. Static content module for Phase 1B — same pattern as
 * content/stays.ts. Only `cenotes-near-aldea-zama` has a published article;
 * the rest are index entries marked `coming-soon` until written. When MDX
 * becomes available, article bodies can move out of packages/i18n and into
 * per-slug .mdx files without changing this index shape.
 */
import type { Locale } from '@maki/i18n';

export type GuideTopicStatus = 'live' | 'coming-soon';

export type GuideTopic = {
  slug: string;
  status: GuideTopicStatus;
  title: Record<Locale, string>;
  teaser: Record<Locale, string>;
};

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    slug: 'cenotes-near-aldea-zama',
    status: 'live',
    title: {
      en: 'Cenotes near Aldea Zama',
      es: 'Cenotes cerca de Aldea Zama',
      de: 'Cenotes in der Nähe von Aldea Zama',
    },
    teaser: {
      en: 'What a cenote actually is, how to visit one properly, and why the closest one is closer than you think.',
      es: 'Qué es un cenote en realidad, cómo visitarlo bien, y por qué el más cercano está más cerca de lo que crees.',
      de: 'Was eine Cenote wirklich ist, wie man sie richtig besucht, und warum die nächste näher ist, als du denkst.',
    },
  },
  {
    slug: 'beach-clubs',
    status: 'coming-soon',
    title: { en: 'Beach clubs', es: 'Beach clubs', de: 'Beach Clubs' },
    teaser: {
      en: 'Which stretch of sand to pick and when to go.',
      es: 'Qué tramo de playa elegir y cuándo ir.',
      de: 'Welcher Strandabschnitt sich lohnt und wann man hingehen sollte.',
    },
  },
  {
    slug: 'restaurants',
    status: 'coming-soon',
    title: { en: 'Restaurants', es: 'Restaurantes', de: 'Restaurants' },
    teaser: {
      en: 'Where we actually eat.',
      es: 'Dónde comemos de verdad.',
      de: 'Wo wir wirklich essen gehen.',
    },
  },
  {
    slug: 'getting-around',
    status: 'coming-soon',
    title: { en: 'Getting around', es: 'Cómo moverte', de: 'Fortbewegung' },
    teaser: {
      en: 'Bikes, taxis, and when you actually need a rental car.',
      es: 'Bicis, taxis, y cuándo de verdad necesitas un coche rentado.',
      de: 'Fahrräder, Taxis, und wann du wirklich einen Mietwagen brauchst.',
    },
  },
  {
    slug: 'water-safety-and-seasons',
    status: 'coming-soon',
    title: {
      en: 'Water safety & seasons',
      es: 'Seguridad en el agua y temporadas',
      de: 'Sicherheit im Wasser & Jahreszeiten',
    },
    teaser: {
      en: 'Sargassum, rain, and when the water is calmest.',
      es: 'Sargazo, lluvia, y cuándo el agua está más tranquila.',
      de: 'Sargassum-Algen, Regen, und wann das Wasser am ruhigsten ist.',
    },
  },
];

export function listGuideTopics(): GuideTopic[] {
  return GUIDE_TOPICS;
}

export function getGuideTopic(slug: string): GuideTopic | undefined {
  return GUIDE_TOPICS.find((topic) => topic.slug === slug);
}
