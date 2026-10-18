import { AdminShell } from '@/components/admin/shell';
import { getSettings } from '@/lib/admin/settings';
import { requireRole } from '@/lib/auth/guards';
import { hasDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) redirect('/setup');
  const user = await requireRole(['admin'], '/admin');
  const settings = await getSettings();
  return (
    <AdminShell user={user} base="/admin" personaName={settings.persona.name}>
      {children}
    </AdminShell>
  );
}
