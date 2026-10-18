export const dynamic = 'force-dynamic';

import { EinstellungenModule } from '@/components/admin/modules/einstellungen';
import { requireRole } from '@/lib/auth/guards';

export default async function Page() {
  await requireRole(['admin'], '/admin');
  return <EinstellungenModule />;
}
