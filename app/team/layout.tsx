import { AdminShell } from '@/components/admin/shell';
import { getSettings } from '@/lib/admin/settings';
import { requireRole } from '@/lib/auth/guards';
import { hasDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) redirect('/setup');
  const user = await requireRole(['team', 'admin'], '/team');
  const settings = await getSettings();
  return (
    <AdminShell user={user} base="/team" personaName={settings.persona.name}>
      {children}
    </AdminShell>
  );
}
