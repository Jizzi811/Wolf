export const dynamic = 'force-dynamic';

import { ProtokollModule } from '@/components/admin/modules/protokoll';
import { requireRole } from '@/lib/auth/guards';

export default async function Page() {
  await requireRole(['admin'], '/admin');
  return <ProtokollModule />;
}
