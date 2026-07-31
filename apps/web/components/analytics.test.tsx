import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

const initMock = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  init: initMock,
}));

describe('Analytics', () => {
  const originalDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const originalDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = originalDomain;
  });

  it('renders nothing and never calls Sentry.init when both env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const { Analytics } = await import('./analytics');
    const { container } = render(<Analytics />);
    expect(container).toBeEmptyDOMElement();
    expect(initMock).not.toHaveBeenCalled();
  });

  it('renders the Plausible script tag only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set', async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'makitulum.com';
    const { Analytics } = await import('./analytics');
    const { container } = render(<Analytics />);
    const script = container.querySelector('script[data-domain="makitulum.com"]');
    expect(script).not.toBeNull();
    expect(script).toHaveAttribute('src', 'https://plausible.io/js/script.js');
  });

  it('initializes Sentry once when NEXT_PUBLIC_SENTRY_DSN is set', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public@o0.ingest.sentry.io/1';
    delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const { Analytics } = await import('./analytics');
    render(<Analytics />);
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://public@o0.ingest.sentry.io/1' }),
    );
  });
});
