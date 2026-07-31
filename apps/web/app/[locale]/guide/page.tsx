import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { listGuideTopics } from '@/content/guide';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations(locale);
  return {
    title: t.guide.index_headline,
    description: t.guide.index_sub,
    alternates: buildAlternates('/guide'),
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  const topics = listGuideTopics();

  return (
    <Container width="default" className="py-20 md:py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
        {t.guide.index_eyebrow}
      </p>
      <Heading level={1} className="mt-3">
        {t.guide.index_headline}
      </Heading>
      <p className="mt-6 max-w-prose text-lg text-[color:var(--color-smoke)]">
        {t.guide.index_sub}
      </p>

      <ul className="mt-16 grid gap-8 md:grid-cols-2">
        {topics.map((topic) => (
          <li
            key={topic.slug}
            className="rounded-md border border-[color:var(--color-gold)]/20 p-6"
          >
            <Heading level={3} as="h2">
              {topic.title[locale]}
            </Heading>
            <p className="mt-2 text-base text-[color:var(--color-smoke)]">{topic.teaser[locale]}</p>
            {topic.status === 'live' ? (
              <Link
                href={`/${locale}/guide/${topic.slug}`}
                className="mt-5 inline-flex items-center min-h-[44px] text-base text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-dark)]"
              >
                {t.guide.read_article} →
              </Link>
            ) : (
              <span className="mt-5 inline-flex items-center min-h-[44px] text-sm uppercase tracking-wider text-[color:var(--color-terracotta)]">
                {t.guide.coming_soon}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
}
