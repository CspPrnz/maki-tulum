import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@maki/i18n';

const LOCALE_COOKIE = 'maki-locale';
const PUBLIC_FILE = /\.(?:.+)$/;

function negotiate(req: NextRequest): Locale {
  // Lesson from best-practices.md: don't auto-redirect by IP — use stored preference,
  // then Accept-Language, with the user always able to override via the switcher.
  const stored = req.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) return stored;

  const accept = req.headers.get('accept-language') ?? '';
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase().slice(0, 2);
    if (tag && (SUPPORTED_LOCALES as readonly string[]).includes(tag)) {
      return tag as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip non-page routes (the API healthz, _next assets, files with extensions).
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/healthz') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/photos') ||
    pathname.startsWith('/brand') ||
    pathname === '/favicon.ico' ||
    pathname === '/site.webmanifest' ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/favicon-') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const seg = pathname.split('/')[1];
  const hasLocale = (SUPPORTED_LOCALES as readonly string[]).includes(seg ?? '');

  if (!hasLocale) {
    const detected = negotiate(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${detected}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  // Pass the locale to layouts via a header so app/layout.tsx can set <html lang>.
  const headers = new Headers(req.headers);
  headers.set('x-locale', seg!);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next|api|healthz|photos|brand|favicon.ico|favicon-|apple-touch-icon|site.webmanifest).*)'],
};
