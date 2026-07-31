import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { listStays } from '@/content/stays';
import { LodgingBusinessJsonLd } from '@/components/jsonld';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations(locale);
  return {
    title: t.meta.tagline,
    description: t.home.intro_body,
    alternates: buildAlternates('/'),
    openGraph: {
      title: t.meta.site_name,
      description: t.home.intro_body,
      type: 'website',
      locale,
      images: ['/photos/villa-18/exterior-1.jpg'],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  const stays = listStays();

  return (
    <>
      <LodgingBusinessJsonLd url={`/${locale}`} description={t.home.intro_body} />

      {/* Hero */}
      <section className="relative bg-[color:var(--color-night)] text-white">
        <div className="absolute inset-0">
          <Image
            src="/photos/villa-18/exterior-1.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
        <Container width="wide" className="relative py-32 md:py-40">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold-light)]">
            {t.home.hero_eyebrow}
          </p>
          <Heading level={1} className="mt-4 max-w-3xl text-white">
            {t.home.hero_headline}
          </Heading>
          <p className="mt-6 max-w-2xl text-lg text-white/85">{t.home.hero_sub}</p>
          <div className="mt-10">
            <Link
              href={`/${locale}/stays`}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)] transition-colors"
            >
              {t.home.book_cta}
            </Link>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-28">
        <Container width="default">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.home.intro_heading}
          </p>
          <Heading level={2} className="mt-3 max-w-3xl">
            {t.home.intro_body}
          </Heading>
        </Container>
      </section>

      {/* Stays preview */}
      <section className="bg-white py-20 md:py-28">
        <Container width="wide">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
                {t.home.stays_heading}
              </p>
              <Heading level={2} className="mt-3">
                {t.home.stays_sub}
              </Heading>
            </div>
            <Link
              href={`/${locale}/stays`}
              className="hidden md:inline-flex items-center min-h-[44px] text-base text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-dark)]"
            >
              {t.common.view_all} →
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {stays.map((stay) => (
              <Link key={stay.slug} href={`/${locale}/stays/${stay.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image
                    src={stay.hero.src}
                    alt={stay.hero.alt[locale]}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {stay.status === 'placeholder' && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs uppercase tracking-wider text-white">
                      {t.stays.photos_pending}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <Heading level={3} as="h3">
                    {stay.name}
                  </Heading>
                  <p className="mt-1 text-sm text-[color:var(--color-smoke)]">
                    {stay.signature[locale]}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--color-smoke)]">
                    {t.stays.sleeps.replace('{n}', String(stay.sleeps))} ·{' '}
                    {t.stays.bedrooms.replace('{n}', String(stay.bedrooms))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Find us */}
      <section className="py-20 md:py-28">
        <Container width="default">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.home.find_us_heading}
          </p>
          <Heading level={2} className="mt-3 max-w-3xl">
            {t.home.find_us_body}
          </Heading>
        </Container>
      </section>
    </>
  );
}
