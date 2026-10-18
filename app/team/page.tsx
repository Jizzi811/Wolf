export const dynamic = 'force-dynamic';

import { DashboardModule } from '@/components/admin/modules/dashboard';
import { requireModule } from '@/lib/auth/guards';

export default async function Page({ searchParams }: { searchParams: Promise<{ tage?: string }> }) {
  await requireModule('dashboard', '/team');
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.tage)) ? Number(sp.tage) : 30;
  return <DashboardModule base="/team" days={days} />;
}
