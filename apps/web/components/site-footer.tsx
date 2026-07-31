import Link from 'next/link';
import type { Locale } from '@maki/i18n';
import { Container } from '@maki/ui';
import { getTranslations } from '@/lib/i18n';

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale);
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-24 border-t border-[color:var(--color-gold)]/15 bg-[color:var(--color-ivory)]"
      data-testid="site-footer"
    >
      <Container width="wide" className="flex flex-col gap-4 py-10 md:flex-row md:justify-between">
        <p className="text-sm text-[color:var(--color-smoke)]">
          © {year} {t.meta.site_name} · Xul Kaa, Tulum, México
        </p>
        <nav aria-label="footer" className="flex flex-wrap gap-4 text-sm">
          <Link
            href={`/${locale}/compound`}
            className="text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]"
          >
            {t.nav.compound}
          </Link>
          <Link
            href={`/${locale}/stays`}
            className="text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]"
          >
            {t.nav.stays}
          </Link>
          <Link
            href={`/${locale}/guide`}
            className="text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]"
          >
            {t.nav.guide}
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
