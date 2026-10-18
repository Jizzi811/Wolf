import { deleteUserAction, saveUserAction } from '@/lib/admin/actions';
import { listUsers } from '@/lib/admin/users';
import { TEAM_MODULES } from '@/lib/auth/guards';
import type { User } from '@/lib/db/schema';
import { ActionForm, ConfirmButton } from '../action-form';
import { Badge, Card, Field, Input, PageHeader, Select, Toggle, fmtDate } from '../ui';

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', team: 'Team', user: 'Mitglied' };

function UserForm({ u, self }: { u?: User; self: number }) {
  return (
    <ActionForm action={saveUserAction} hidden={u ? { id: u.id } : {}} submitLabel={u ? 'Speichern' : 'Anlegen'}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input name="name" defaultValue={u?.name ?? ''} required /></Field>
        {u ? <Field label="E-Mail"><Input value={u.email} disabled /></Field> : <Field label="E-Mail"><Input name="email" type="email" required /></Field>}
        <Field label="Rolle">
          <Select name="role" defaultValue={u?.role ?? 'team'} disabled={u?.id === self}>
            <option value="admin">Admin (alles)</option>
            <option value="team">Team (Rechte unten)</option>
            <option value="user">Mitglied (eigener Bereich)</option>
          </Select>
          {u?.id === self ? <input type="hidden" name="role" value="admin" /> : null}
        </Field>
        <Field label={u ? 'Neues Passwort (leer = unverändert)' : 'Passwort'} hint="Mindestens 10 Zeichen."><Input name="password" type="password" autoComplete="new-password" required={!u} /></Field>
      </div>
      <fieldset className="rounded-xl border border-gold/10 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Team-Rechte (nur Rolle Team)</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TEAM_MODULES.map((m) => (
            <label key={m.key} className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="permissions" value={m.key} defaultChecked={u?.permissions.includes(m.key) ?? true} className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
              <span><span className="text-cream">{m.label}</span><br /><span className="text-xs text-muted">{m.description}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      {u ? <Toggle name="isActive" label="Aktiv" hint="Deaktivierte Konten können sich nicht anmelden." defaultChecked={u.isActive} /> : <input type="hidden" name="isActive" value="on" />}
    </ActionForm>
  );
}

export async function BenutzerModule({ self }: { self: User }) {
  const users = await listUsers();
  return (
    <>
      <PageHeader title="Benutzer & Team" description="Admins sehen alles. Team-Mitglieder bekommen genau die Module, die du freischaltest. Mitglieder haben nur ihren eigenen Bereich (/mein)." />
      <Card title="Neues Konto" className="mb-4"><UserForm self={self.id} /></Card>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <Card key={u.id}>
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-cream">{u.name || u.email}</span>
                <span className="text-sm text-muted">{u.email}</span>
                <Badge tone={u.role === 'admin' ? 'gold' : u.role === 'team' ? 'blue' : 'neutral'}>{ROLE_LABEL[u.role]}</Badge>
                {!u.isActive ? <Badge tone="red">deaktiviert</Badge> : null}
                <span className="ml-auto text-xs text-muted">zuletzt {fmtDate(u.lastLoginAt)}</span>
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                {u.role === 'team' ? <p className="text-xs text-muted">Rechte: {u.permissions.map((p) => TEAM_MODULES.find((m) => m.key === p)?.label ?? p).join(', ') || 'keine'}</p> : null}
                <UserForm u={u} self={self.id} />
                {u.id !== self.id ? <div><ConfirmButton action={deleteUserAction} label="Konto löschen" variant="danger" confirm={`Konto ${u.email} endgültig löschen?`} hidden={{ id: u.id }} /></div> : null}
              </div>
            </details>
          </Card>
        ))}
      </div>
    </>
  );
}
