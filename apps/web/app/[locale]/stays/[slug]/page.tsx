import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@maki/i18n';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { getStay, listStays } from '@/content/stays';
import { HotelRoomJsonLd } from '@/components/jsonld';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const stays = listStays();
  return SUPPORTED_LOCALES.flatMap((locale) =>
    stays.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const stay = getStay(slug);
  if (!stay) return {};
  const t = await getTranslations(locale);
  return {
    title: stay.name,
    description: stay.signature[locale],
    alternates: buildAlternates(`/stays/${slug}`),
    openGraph: {
      title: `${stay.name} · ${t.meta.site_name}`,
      description: stay.signature[locale],
      type: 'website',
      locale,
      images: [stay.hero.src],
    },
  };
}

export default async function StayDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const stay = getStay(slug);
  if (!stay) notFound();
  const t = await getTranslations(locale);

  const localStay = t.stays[stay.slug.replace('-', '_') as 'villa_18' | 'villa_19'];

  return (
    <>
      <HotelRoomJsonLd
        stay={{
          url: `/${locale}/stays/${stay.slug}`,
          name: stay.name,
          description: stay.signature[locale],
          bedrooms: stay.bedrooms,
          bathrooms: stay.bathrooms,
          occupancy: stay.sleeps,
          imageUrls: [stay.hero.src, ...stay.photos.map((p) => p.src)],
        }}
      />

      {/* Hero photo */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[color:var(--color-night)]">
        <Image
          src={stay.hero.src}
          alt={stay.hero.alt[locale]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <Container width="default" className="py-16 md:py-20">
        <Link
          href={`/${locale}/stays`}
          className="inline-flex items-center min-h-[44px] text-sm text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]"
        >
          ← {t.nav.stays}
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.stays.stay_eyebrow}
          </p>
          <Heading level={1} className="mt-3">
            {stay.name}
          </Heading>
          <p className="mt-3 text-lg text-[color:var(--color-smoke)]">
            {stay.signature[locale]}
          </p>
          {stay.status === 'placeholder' && (
            <p className="mt-3 text-sm uppercase tracking-wider text-[color:var(--color-terracotta)]">
              {t.stays.photos_pending}
            </p>
          )}

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-base">
            <div>
              <dt className="text-xs uppercase tracking-wider text-[color:var(--color-smoke)]">
                Sleeps
              </dt>
              <dd className="mt-1 font-medium">
                {t.stays.sleeps.replace('{n}', String(stay.sleeps))}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-[color:var(--color-smoke)]">
                Bedrooms
              </dt>
              <dd className="mt-1 font-medium">
                {t.stays.bedrooms.replace('{n}', String(stay.bedrooms))}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-[color:var(--color-smoke)]">
                Bathrooms
              </dt>
              <dd className="mt-1 font-medium">
                {t.stays.bathrooms.replace('{n}', String(stay.bathrooms))}
              </dd>
            </div>
          </dl>
        </div>

        {/* What it's like */}
        <section className="mt-16 max-w-prose">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.stays.what_its_like_heading}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-[color:var(--color-night)]">
            {localStay.what_its_like}
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-md border border-[color:var(--color-gold)]/30 bg-[color:var(--color-ivory)] p-8">
          <Heading level={3} as="h2">
            {t.stays.request_to_book}
          </Heading>
          <p className="mt-2 text-base text-[color:var(--color-smoke)]">
            {t.stays.book_note}
          </p>
          <Link
            href={`/${locale}/book`}
            className="mt-5 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)]"
          >
            {t.stays.request_to_book}
          </Link>
        </section>
      </Container>

      {/* Photo gallery */}
      <section className="bg-white py-16 md:py-20">
        <Container width="wide">
          <div className="grid gap-3 md:grid-cols-3">
            {stay.photos.map((photo) => (
              <div key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image
                  src={photo.src}
                  alt={photo.alt[locale]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
