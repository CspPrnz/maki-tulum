import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { getGuideTopic, listGuideTopics } from '@/content/guide';
import { serializeLd } from '@/components/jsonld';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const liveTopics = listGuideTopics().filter((topic) => topic.status === 'live');
  return SUPPORTED_LOCALES.flatMap((locale) =>
    liveTopics.map((topic) => ({ locale, slug: topic.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const topic = getGuideTopic(slug);
  if (!topic || topic.status !== 'live') return {};
  const t = await getTranslations(locale);
  return {
    title: topic.title[locale],
    description: topic.teaser[locale],
    alternates: buildAlternates(`/guide/${slug}`),
    openGraph: {
      title: `${topic.title[locale]} · ${t.meta.site_name}`,
      description: topic.teaser[locale],
      type: 'article',
      locale,
    },
  };
}

export default async function GuideArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const topic = getGuideTopic(slug);
  if (!topic || topic.status !== 'live') notFound();
  const t = await getTranslations(locale);

  // Only the cenotes article exists today; the content module (content/guide.ts)
  // is the single source of truth for which slugs are 'live'.
  const c = t.guide.cenotes;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.heading,
    description: c.intro,
    inLanguage: locale,
    url: `/${locale}/guide/${slug}`,
    author: { '@type': 'Organization', name: 'Maki Tulum' },
    publisher: { '@type': 'Organization', name: 'Maki Tulum' },
  };

  return (
    <Container width="default" className="py-20 md:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(articleLd) }}
      />

      <Link
        href={`/${locale}/guide`}
        className="inline-flex items-center min-h-[44px] text-sm text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]"
      >
        ← {t.guide.back_to_guide}
      </Link>

      <Heading level={1} className="mt-6">
        {c.heading}
      </Heading>
      <p className="mt-4 max-w-prose text-lg text-[color:var(--color-smoke)]">{c.intro}</p>

      <div className="mt-12 max-w-prose space-y-10">
        <section>
          <Heading level={3} as="h2">
            {c.what_is_a_cenote_heading}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--color-smoke)]">
            {c.what_is_a_cenote_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {c.getting_there_heading}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--color-smoke)]">
            {c.getting_there_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {c.etiquette_heading}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--color-smoke)]">
            {c.etiquette_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {c.safety_heading}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--color-smoke)]">
            {c.safety_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {c.timing_heading}
          </Heading>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--color-smoke)]">
            {c.timing_body}
          </p>
        </section>
      </div>

      <section className="mt-16 rounded-md border border-[color:var(--color-gold)]/30 bg-[color:var(--color-ivory)] p-8">
        <Heading level={3} as="h2">
          {c.closing_heading}
        </Heading>
        <p className="mt-2 max-w-prose text-base text-[color:var(--color-smoke)]">
          {c.closing_body}
        </p>
        <Link
          href={`/${locale}/guide`}
          className="mt-5 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)]"
        >
          {t.guide.back_to_guide}
        </Link>
      </section>
    </Container>
  );
}
