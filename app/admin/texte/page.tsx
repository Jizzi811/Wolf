export const dynamic = 'force-dynamic';

import { TexteModule } from '@/components/admin/modules/texte';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  const user = await requireModule('texte', '/admin');
  return <TexteModule isAdmin={user.role === 'admin'} />;
}
