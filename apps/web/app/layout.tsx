import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@maki/i18n';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'),
  title: { default: 'Maki Tulum', template: '%s · Maki Tulum' },
  description: 'A quiet jungle compound off Tulum’s noisy center, in Aldea Zama.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The middleware sets x-locale based on the URL segment; we read it here so
  // SSR'd HTML has the correct <html lang>. Falls back to the default locale.
  const h = await headers();
  const headerLocale = h.get('x-locale') ?? DEFAULT_LOCALE;
  const lang = (SUPPORTED_LOCALES as readonly string[]).includes(headerLocale)
    ? headerLocale
    : DEFAULT_LOCALE;
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
