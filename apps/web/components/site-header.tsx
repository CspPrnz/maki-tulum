import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@maki/i18n';
import { Container } from '@maki/ui';
import { LocaleSwitcher } from './locale-switcher';
import { getTranslations } from '@/lib/i18n';

const NAV_ITEMS = [
  { key: 'compound', href: 'compound' },
  { key: 'stays', href: 'stays' },
  { key: 'days', href: 'days' },
  { key: 'guide', href: 'guide' },
  { key: 'book', href: 'book' },
] as const;

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale);
  return (
    <header
      className="border-b border-[color:var(--color-gold)]/15 bg-[color:var(--color-ivory)]"
      data-testid="site-header"
    >
      <Container width="wide" className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 min-h-[44px]"
          aria-label={t.meta.site_name}
        >
          <Image
            src="/brand/wordmark-gold.png"
            alt={t.meta.site_name}
            width={140}
            height={56}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav aria-label="primary" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}/${item.href}`}
              className="inline-flex items-center min-h-[44px] px-3 text-base text-[color:var(--color-night)] hover:text-[color:var(--color-gold)]"
            >
              {t.nav[item.key as keyof typeof t.nav]}
            </Link>
          ))}
          <span className="mx-2 hidden h-5 w-px bg-[color:var(--color-gold)]/25 md:inline-block" />
          <LocaleSwitcher current={locale} />
        </nav>
      </Container>
    </header>
  );
}
