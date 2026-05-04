import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { listStays } from '@/content/stays';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations(locale);
  return {
    title: t.nav.stays,
    description: t.stays.index_sub,
    alternates: buildAlternates('/stays'),
  };
}

export default async function StaysIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  const stays = listStays();

  return (
    <Container width="wide" className="py-20 md:py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
        {t.stays.index_eyebrow}
      </p>
      <Heading level={1} className="mt-3 max-w-3xl">
        {t.stays.index_headline}
      </Heading>
      <p className="mt-6 max-w-2xl text-lg text-[color:var(--color-smoke)]">
        {t.stays.index_sub}
      </p>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        {stays.map((stay) => (
          <article key={stay.slug} className="group">
            <Link href={`/${locale}/stays/${stay.slug}`} className="block">
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
            </Link>
            <div className="mt-5">
              <Heading level={2} as="h2">
                <Link
                  href={`/${locale}/stays/${stay.slug}`}
                  className="hover:text-[color:var(--color-gold)]"
                >
                  {stay.name}
                </Link>
              </Heading>
              <p className="mt-2 text-base text-[color:var(--color-smoke)]">
                {stay.signature[locale]}
              </p>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[color:var(--color-smoke)]">
                <div>
                  <dt className="sr-only">Sleeps</dt>
                  <dd>{t.stays.sleeps.replace('{n}', String(stay.sleeps))}</dd>
                </div>
                <div>
                  <dt className="sr-only">Bedrooms</dt>
                  <dd>{t.stays.bedrooms.replace('{n}', String(stay.bedrooms))}</dd>
                </div>
                <div>
                  <dt className="sr-only">Bathrooms</dt>
                  <dd>{t.stays.bathrooms.replace('{n}', String(stay.bathrooms))}</dd>
                </div>
              </dl>
              <Link
                href={`/${locale}/stays/${stay.slug}`}
                className="mt-5 inline-flex items-center min-h-[44px] text-base text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-dark)]"
              >
                {t.stays.view_stay} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
