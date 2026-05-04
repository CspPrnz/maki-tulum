import type { HTMLAttributes, ReactNode } from 'react';

type Level = 1 | 2 | 3 | 4;

const levelClass: Record<Level, string> = {
  1: 'text-4xl md:text-5xl font-light leading-[1.05] tracking-tight',
  2: 'text-3xl md:text-4xl font-light leading-tight tracking-tight',
  3: 'text-xl md:text-2xl font-medium leading-snug',
  4: 'text-lg font-medium leading-snug',
};

type Props = {
  level: Level;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>;

export function Heading({ level, as, children, className = '', ...rest }: Props) {
  const Tag = (as ?? `h${level}`) as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <Tag className={`${levelClass[level]} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
