import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations(locale);
  return {
    title: t.days.headline,
    description: t.days.intro_body,
    alternates: buildAlternates('/days'),
  };
}

export default async function DaysPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);

  return (
    <Container width="default" className="py-20 md:py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
        {t.days.eyebrow}
      </p>
      <Heading level={1} className="mt-3">
        {t.days.headline}
      </Heading>
      <p className="mt-6 max-w-prose text-lg text-[color:var(--color-smoke)]">
        {t.days.intro_body}
      </p>

      <div className="mt-16 space-y-12">
        <section>
          <Heading level={3} as="h2">
            {t.days.mornings_heading}
          </Heading>
          {/* TODO(felix): verify — invented: "the pool skimmer starting somewhere across the garden" implies a specific maintenance routine/timing not confirmed anywhere in source docs. */}
          <p className="mt-3 max-w-prose text-base leading-relaxed text-[color:var(--color-smoke)]">
            {t.days.mornings_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {t.days.days_heading}
          </Heading>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-[color:var(--color-smoke)]">
            {t.days.days_body}
          </p>
        </section>

        <section>
          <Heading level={3} as="h2">
            {t.days.nights_heading}
          </Heading>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-[color:var(--color-smoke)]">
            {t.days.nights_body}
          </p>
        </section>
      </div>

      <section className="mt-16 rounded-md border border-[color:var(--color-gold)]/30 bg-[color:var(--color-ivory)] p-8">
        <Heading level={3} as="h2">
          {t.days.cta_heading}
        </Heading>
        <p className="mt-2 text-base text-[color:var(--color-smoke)]">{t.days.cta_body}</p>
        <Link
          href={`/${locale}/guide`}
          className="mt-5 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)]"
        >
          {t.days.cta_label}
        </Link>
      </section>
    </Container>
  );
}
