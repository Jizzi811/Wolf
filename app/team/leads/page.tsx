export const dynamic = 'force-dynamic';

import { LeadsModule } from '@/components/admin/modules/leads';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('leads', '/team');
  return <LeadsModule />;
}
