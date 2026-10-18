export const dynamic = 'force-dynamic';

import { StimmeModule } from '@/components/admin/modules/stimme';
import { requireModule } from '@/lib/auth/guards';

export default async function Page() {
  const user = await requireModule('persona', '/admin');
  return <StimmeModule isAdmin={user.role === 'admin'} />;
}
