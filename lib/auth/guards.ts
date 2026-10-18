import { redirect } from 'next/navigation';
import { getCurrentUser } from './session';
import type { Role, User } from '@/lib/db/schema';

/** Alle Module, die Team-Mitgliedern einzeln freigeschaltet werden können. */
export const TEAM_MODULES: { key: string; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard & Statistiken', description: 'Kennzahlen, Diagramme, Nutzung' },
  { key: 'gespraeche', label: 'Gespräche', description: 'Gesprächsprotokolle lesen' },
  { key: 'leads', label: 'Leads', description: 'Interessenten sehen und bearbeiten' },
  { key: 'wissen', label: 'Wissen', description: 'Wissensbasis pflegen und freigeben' },
  { key: 'dateien', label: 'Dateien', description: 'Dokumente hochladen und auslesen' },
  { key: 'fragen', label: 'Offene Fragen', description: 'Fragen, die CLOSER nicht beantworten konnte' },
  { key: 'persona', label: 'Persona & Stimme', description: 'Name, Bild, Begrüßung, Charakter, Stimme' },
  { key: 'texte', label: 'Texte & Design', description: 'Texte der öffentlichen Seite, Farben' },
  { key: 'anbindung', label: 'Plattform-Anbindung', description: 'Brücke zur Plattform, Synchronisation' },
];

export function hasModule(user: User, moduleKey: string): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'team') return user.permissions.includes(moduleKey);
  return false;
}

/** Erzwingt eine angemeldete Sitzung, sonst Weiterleitung zum Login. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  return user;
}

export async function requireRole(roles: Role[], next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

/** Admin oder Team-Mitglied mit Recht für das Modul. */
export async function requireModule(moduleKey: string, next?: string): Promise<User> {
  const user = await requireUser(next);
  if (user.role === 'admin') return user;
  if (user.role === 'team' && user.permissions.includes(moduleKey)) return user;
  redirect(homeFor(user.role));
}

export function homeFor(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'team') return '/team';
  return '/mein';
}
