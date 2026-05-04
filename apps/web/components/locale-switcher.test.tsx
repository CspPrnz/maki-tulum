import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleSwitcher } from './locale-switcher';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/stays/villa-18',
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    pushMock.mockClear();
    document.cookie = '';
  });

  it('renders all three supported locales', () => {
    render(<LocaleSwitcher current="en" />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('marks the current locale with aria-current=true', () => {
    render(<LocaleSwitcher current="de" />);
    const de = screen.getByText('DE');
    expect(de).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('EN')).not.toHaveAttribute('aria-current');
  });

  it('rewrites the locale segment in the URL when switching', () => {
    render(<LocaleSwitcher current="en" />);
    fireEvent.click(screen.getByText('DE'));
    expect(pushMock).toHaveBeenCalledWith('/de/stays/villa-18');
  });

  it('persists the choice to a cookie so SSR honors it next request', () => {
    render(<LocaleSwitcher current="en" />);
    fireEvent.click(screen.getByText('ES'));
    expect(document.cookie).toContain('maki-locale=es');
  });

  it('every button meets the 44x44 touch-target floor (a11y)', () => {
    render(<LocaleSwitcher current="en" />);
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn.className).toMatch(/min-h-\[44px\]/);
      expect(btn.className).toMatch(/min-w-\[44px\]/);
    }
  });
});
