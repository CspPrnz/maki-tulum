'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@maki/i18n';

const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  de: 'DE',
};

const LOCALE_COOKIE = 'maki-locale';

function setLocaleCookie(locale: Locale) {
  // 1 year, lax. Lesson from best-practices.md: cookie-sync persisted preference
  // so SSR can read it without round-tripping to the client.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    setLocaleCookie(next);
    const segments = (pathname ?? '/').split('/');
    if (segments[1] && (SUPPORTED_LOCALES as readonly string[]).includes(segments[1])) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    router.push(segments.join('/') || `/${next}`);
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-1"
      data-testid="locale-switcher"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-current={l === current ? 'true' : undefined}
          aria-label={`Switch to ${LOCALE_LABEL[l]}`}
          onClick={() => switchTo(l)}
          className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-2 text-sm font-medium ${
            l === current
              ? 'text-[color:var(--color-gold)]'
              : 'text-[color:var(--color-smoke)] hover:text-[color:var(--color-gold)]'
          }`}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
