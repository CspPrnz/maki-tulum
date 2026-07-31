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
    title: t.book.stub_heading,
    description: t.book.stub_body,
    alternates: buildAlternates('/book'),
  };
}

export default async function BookPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations(locale);
  return (
    <Container width="default" className="py-20 md:py-28">
      <Heading level={1}>{t.book.stub_heading}</Heading>
      <p className="mt-6 max-w-prose text-lg text-[color:var(--color-smoke)]">{t.book.stub_body}</p>
      <Link
        href={`/${locale}/stays`}
        className="mt-8 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-md bg-[color:var(--color-gold)] text-white font-medium hover:bg-[color:var(--color-gold-dark)]"
      >
        {t.book.view_stays}
      </Link>
    </Container>
  );
}
