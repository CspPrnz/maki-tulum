import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Long-form body text. 16px floor enforced via globals.css.
 * Tight max-width for legibility (~62 characters).
 */
export function Prose({
  children,
  className = '',
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`max-w-prose text-base leading-relaxed text-[color:var(--color-smoke)] ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
