export const dynamic = 'force-dynamic';

import { WissenEditModule } from '@/components/admin/modules/wissen';
import { requireModule } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireModule('wissen', '/admin');
  const { id } = await params;
  if (id === 'neu') return <WissenEditModule base="/admin" id="neu" />;
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) notFound();
  return <WissenEditModule base="/admin" id={n} />;
}
