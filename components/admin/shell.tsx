import Link from 'next/link';
import { logoutAction } from '@/lib/admin/actions';
import { hasModule } from '@/lib/auth/guards';
import type { User } from '@/lib/db/schema';
import { NavLinks } from './nav-links';

export interface NavItem {
  href: string;
  label: string;
  moduleKey: string;
}

/** Navigationseinträge je nach Rolle und Rechten. */
export function navFor(user: User, base: '/admin' | '/team'): NavItem[] {
  const items: { path: string; label: string; moduleKey: string; adminOnly?: boolean }[] = [
    { path: '', label: 'Dashboard', moduleKey: 'dashboard' },
    { path: '/gespraeche', label: 'Gespräche', moduleKey: 'gespraeche' },
    { path: '/leads', label: 'Leads', moduleKey: 'leads' },
    { path: '/fragen', label: 'Offene Fragen', moduleKey: 'fragen' },
    { path: '/wissen', label: 'Wissen', moduleKey: 'wissen' },
    { path: '/dateien', label: 'Dateien', moduleKey: 'dateien' },
    { path: '/persona', label: 'Persona', moduleKey: 'persona' },
    { path: '/stimme', label: 'Stimme & Modell', moduleKey: 'persona' },
    { path: '/texte', label: 'Texte & Design', moduleKey: 'texte' },
    { path: '/anbindung', label: 'Plattform-Anbindung', moduleKey: 'anbindung' },
    { path: '/einstellungen', label: 'Einstellungen', moduleKey: 'admin', adminOnly: true },
    { path: '/benutzer', label: 'Benutzer & Team', moduleKey: 'admin', adminOnly: true },
    { path: '/protokoll', label: 'Protokoll', moduleKey: 'admin', adminOnly: true },
  ];
  return items
    .filter((i) => (i.adminOnly ? user.role === 'admin' : hasModule(user, i.moduleKey)))
    .map((i) => ({ href: `${base}${i.path}`, label: i.label, moduleKey: i.moduleKey }));
}

export function AdminShell({ user, base, children, personaName }: { user: User; base: '/admin' | '/team'; children: React.ReactNode; personaName: string }) {
  const nav = navFor(user, base);
  return (
    <div className="relative z-0 mx-auto flex min-h-svh w-full max-w-[90rem] flex-col lg:flex-row">
      <aside className="flex w-full flex-col border-b border-gold/10 bg-ink-2/60 px-4 py-4 backdrop-blur-sm lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href={base} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark font-display text-sm font-bold text-ink">
              {personaName.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold text-cream">{personaName}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gold/80">{base === '/admin' ? 'Admin' : 'Team'}</span>
            </span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-cream lg:hidden">Zur Seite</Link>
        </div>

        <NavLinks items={nav} />

        <div className="mt-auto hidden flex-col gap-2 border-t border-gold/10 pt-4 text-xs text-muted lg:flex">
          <Link href="/" className="hover:text-cream">Öffentliche Seite öffnen</Link>
          <p className="truncate">
            <span className="text-cream">{user.name || user.email}</span>
            <br />
            {user.email}
          </p>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-gold/20 px-3 py-1 text-xs text-cream hover:border-gold/60">Abmelden</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
