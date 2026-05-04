import Link from 'next/link';
import { Container, Heading } from '@maki/ui';

export default function NotFound() {
  return (
    <Container width="default" className="py-32">
      <Heading level={1}>404</Heading>
      <p className="mt-6 text-lg text-[color:var(--color-smoke)]">
        We couldn&apos;t find that page.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center min-h-[44px] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-dark)]"
      >
        ← Home
      </Link>
    </Container>
  );
}
