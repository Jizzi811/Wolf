export const dynamic = 'force-dynamic';

import { FragenModule } from '@/components/admin/modules/fragen';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('fragen', '/admin');
  return <FragenModule base="/admin" />;
}
