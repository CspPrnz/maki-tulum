import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-gold)] text-white hover:bg-[color:var(--color-gold-dark)] focus-visible:bg-[color:var(--color-gold-dark)]',
  secondary:
    'bg-transparent border border-[color:var(--color-gold)] text-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)]/10',
  ghost: 'bg-transparent text-[color:var(--color-night)] hover:bg-[color:var(--color-gold)]/10',
};

type Props = {
  variant?: Variant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 44×44 minimum touch target enforced via min-h/min-w (best-practices.md §a11y).
 */
export function Button({ variant = 'primary', children, className = '', type, ...rest }: Props) {
  return (
    <button
      type={type ?? 'button'}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-md text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
