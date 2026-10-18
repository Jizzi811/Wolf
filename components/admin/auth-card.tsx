import Link from 'next/link';

/** Zentrierte Karte für Login, Setup und Registrierung. */
export function AuthCard({ title, description, children, personaName }: { title: string; description?: string; children: React.ReactNode; personaName: string }) {
  return (
    <main className="relative z-0 mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 flex items-center gap-3 self-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark font-display text-base font-bold text-ink">{personaName.slice(0, 1).toUpperCase()}</span>
        <span className="font-display text-xl font-semibold text-cream">{personaName}</span>
      </Link>
      <section className="rounded-3xl border border-gold/15 bg-ink-2/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-cream">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
