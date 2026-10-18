export const dynamic = 'force-dynamic';

import { GespraechDetailModule } from '@/components/admin/modules/gespraeche';
import { requireModule } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireModule('gespraeche', '/team');
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) notFound();
  return <GespraechDetailModule base="/team" id={n} canDelete={user.role === 'admin'} />;
}
