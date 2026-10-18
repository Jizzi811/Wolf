export const dynamic = 'force-dynamic';

import { DateiDetailModule } from '@/components/admin/modules/dateien';
import { requireModule } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireModule('dateien', '/team');
  const { id } = await params;
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) notFound();
  return <DateiDetailModule base="/team" id={n} />;
}
