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
    title: t.nav.guide,
    description: t.guide.stub_body,
    alternates: buildAlternates('/guide'),
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  return (
    <Container width="default" className="py-20 md:py-28">
      <Heading level={1}>{t.guide.stub_heading}</Heading>
      <p className="mt-6 max-w-prose text-lg text-[color:var(--color-smoke)]">
        {t.guide.stub_body}
      </p>
    </Container>
  );
}
