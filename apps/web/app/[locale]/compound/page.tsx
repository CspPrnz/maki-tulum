import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Heading } from '@maki/ui';
import { isLocale, getTranslations, buildAlternates } from '@/lib/i18n';
import { listCompoundPhotos } from '@/content/compound';
import { LodgingBusinessJsonLd } from '@/components/jsonld';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations(locale);
  return {
    title: t.compound.headline,
    description: t.compound.intro_body,
    alternates: buildAlternates('/compound'),
  };
}

export default async function CompoundPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  const photos = listCompoundPhotos();
  const [heroPhoto] = photos;
  if (!heroPhoto) notFound();

  return (
    <>
      <LodgingBusinessJsonLd url={`/${locale}/compound`} description={t.compound.intro_body} />

      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-[color:var(--color-night)]">
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt[locale]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <Container width="default" className="py-16 md:py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
          {t.compound.hero_eyebrow}
        </p>
        <Heading level={1} className="mt-3">
          {t.compound.headline}
        </Heading>
        {/* TODO(felix): verify — invented: "no front desk between you and the gate" asserts an operational/staffing detail not confirmed in idea-v3.md, CONTEXT.md, or shipped copy. */}
        <p className="mt-6 max-w-prose text-lg text-[color:var(--color-smoke)]">
          {t.compound.intro_body}
        </p>
      </Container>

      <section className="bg-white py-16 md:py-20">
        <Container width="default">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.compound.location_heading}
          </p>
          <Heading level={2} className="mt-3 max-w-2xl">
            {t.compound.location_body}
          </Heading>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container width="default">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.compound.design_heading}
          </p>
          <Heading level={2} className="mt-3 max-w-2xl">
            {t.compound.design_body}
          </Heading>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container width="wide">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.compound.photos_heading}
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {photos.map((photo) => (
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

      <section className="py-16 md:py-20">
        <Container width="default">
          <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-gold)]">
            {t.compound.stays_heading}
          </p>
          <p className="mt-4 max-w-prose text-lg text-[color:var(--color-smoke)]">
            {t.compound.stays_body}
          </p>
          <Link
            href={`/${locale}/stays`}
            className="mt-8 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)]"
          >
            {t.compound.cta}
          </Link>
        </Container>
      </section>
    </>
  );
}
