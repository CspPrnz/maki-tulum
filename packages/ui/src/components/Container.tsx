import type { HTMLAttributes, ReactNode } from 'react';

type Width = 'narrow' | 'default' | 'wide';

const widthClass: Record<Width, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
};

export function Container({
  children,
  width = 'default',
  className = '',
  ...rest
}: { children: ReactNode; width?: Width } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mx-auto px-6 md:px-10 ${widthClass[width]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
