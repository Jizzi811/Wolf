export const dynamic = 'force-dynamic';

import { GespraecheModule } from '@/components/admin/modules/gespraeche';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('gespraeche', '/team');
  return <GespraecheModule base="/team" />;
}
