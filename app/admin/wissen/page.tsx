export const dynamic = 'force-dynamic';

import { WissenModule } from '@/components/admin/modules/wissen';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  await requireModule('wissen', '/admin');
  return <WissenModule base="/admin" />;
}
