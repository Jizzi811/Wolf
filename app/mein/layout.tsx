import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/lib/admin/actions';
import { getSettings } from '@/lib/admin/settings';
import { homeFor, requireUser } from '@/lib/auth/guards';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MeinLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) redirect('/setup');
  const user = await requireUser('/mein');
  const settings = await getSettings();
  return (
    <div className="relative z-0 mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-gold/10 pb-4">
        <Link href="/mein" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark font-display text-sm font-bold text-ink">{settings.persona.name.slice(0, 1).toUpperCase()}</span>
          <span className="font-display text-lg font-semibold text-cream">{settings.persona.name} · Mein Bereich</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-cream/80 hover:text-cream">Gespräch starten</Link>
          {user.role !== 'user' ? <Link href={homeFor(user.role)} className="text-gold-light hover:underline">Verwaltung</Link> : null}
          <form action={logoutAction}><button type="submit" className="rounded-full border border-gold/20 px-3 py-1 text-xs text-cream hover:border-gold/60">Abmelden</button></form>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
