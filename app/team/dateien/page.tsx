export const dynamic = 'force-dynamic';

import { DateienModule } from '@/components/admin/modules/dateien';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('dateien', '/team');
  return <DateienModule base="/team" />;
}
