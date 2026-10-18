export const dynamic = 'force-dynamic';

import { PersonaModule } from '@/components/admin/modules/persona';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  const user = await requireModule('persona', '/admin');
  return <PersonaModule isAdmin={user.role === 'admin'} />;
}
