import { recentAudit } from '@/lib/admin/audit';
import { listUsers } from '@/lib/admin/users';
import { Card, PageHeader, Table, Td, fmtDate } from '../ui';

export async function ProtokollModule() {
  const [rows, users] = await Promise.all([recentAudit(200), listUsers()]);
  const names = new Map(users.map((u) => [u.id, u.name || u.email]));
  return (
    <>
      <PageHeader title="Protokoll" description="Wer hat wann was geändert (letzte 200 Einträge)." />
      <Card>
        <Table head={['Zeit', 'Wer', 'Aktion', 'Ziel', 'Details']}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{fmtDate(r.createdAt)}</Td>
              <Td>{r.userId ? names.get(r.userId) ?? `#${r.userId}` : 'System'}</Td>
              <Td className="font-mono text-xs">{r.action}</Td>
              <Td>{r.target ?? '–'}</Td>
              <Td className="font-mono text-xs text-muted">{Object.keys(r.meta).length ? JSON.stringify(r.meta) : ''}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
