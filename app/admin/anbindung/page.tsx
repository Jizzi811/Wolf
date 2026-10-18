export const dynamic = 'force-dynamic';

import { AnbindungModule } from '@/components/admin/modules/anbindung';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('anbindung', '/admin');
  return <AnbindungModule />;
}
