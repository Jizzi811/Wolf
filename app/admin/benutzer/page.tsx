export const dynamic = 'force-dynamic';

import { BenutzerModule } from '@/components/admin/modules/benutzer';
import { requireRole } from '@/lib/auth/guards';

export default async function Page() {
  const user = await requireRole(['admin'], '/admin');
  return <BenutzerModule self={user} />;
}
