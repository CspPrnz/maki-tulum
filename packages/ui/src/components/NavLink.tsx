import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
  active?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Plain nav link. We deliberately don't depend on Next.js Link here so this
 * stays portable to React Native via a small adapter later.
 * Apps wrap this in Next's Link via the `as` pattern when client-side nav matters.
 */
export function NavLink({ href, children, active, className = '', ...rest }: Props) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center min-h-[44px] px-3 text-base text-[color:var(--color-night)] hover:text-[color:var(--color-gold)] ${active ? 'text-[color:var(--color-gold)]' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </a>
  );
}
