import Link from 'next/link';
import { CloserApp } from '@/components/closer/closer-app';
import { CloserFooter } from '@/components/closer/closer-footer';
import { getSettings } from '@/lib/admin/settings';
import { getCurrentUser } from '@/lib/auth/session';
import { homeFor } from '@/lib/auth/guards';
import { hasDatabase } from '@/lib/db';
import { publicUiFromSettings } from '@/lib/public-ui';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const settings = await getSettings();
  const user = hasDatabase() ? await getCurrentUser().catch(() => null) : null;
  const ui = publicUiFromSettings(settings, Boolean(user));
  const d = ui.design;
  return (
    <>
      <style>{`:root{--color-gold:${d.accent};--color-gold-light:${d.accentLight};--color-gold-dark:${d.accentDark};--color-ink:${d.background};}`}</style>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 text-xs text-muted/80">
        {user ? (
          <>
            <span className="hidden sm:inline">{user.name || user.email}</span>
            <Link href={homeFor(user.role)} className="rounded-full border border-gold/20 px-3 py-1 hover:border-gold/60 hover:text-cream">
              {user.role === 'user' ? 'Mein Bereich' : 'Verwaltung'}
            </Link>
          </>
        ) : hasDatabase() ? (
          <Link href="/login" className="rounded-full border border-gold/20 px-3 py-1 hover:border-gold/60 hover:text-cream">Anmelden</Link>
        ) : null}
      </div>
      <CloserApp ui={ui} />
      <CloserFooter text={ui.footer} />
    </>
  );
}
