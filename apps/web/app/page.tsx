export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-[color:var(--color-gold)]">
        Phase 0 · Foundations
      </p>
      <h1 className="mt-4 text-5xl font-light text-[color:var(--color-night)]">Maki Tulum</h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[color:var(--color-smoke)]">
        A small jungle compound in Aldea Zama. The site you&apos;re looking at is a placeholder
        while the real one is being built. Story-first marketing pages land in Phase 1.
      </p>
      <p className="mt-12 text-sm text-[color:var(--color-smoke)]">
        Liveness:{' '}
        <a className="underline decoration-dotted" href="/healthz">
          /healthz
        </a>
      </p>
    </main>
  );
}
