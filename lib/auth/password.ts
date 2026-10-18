import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 11);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Mindestanforderung: 10 Zeichen. Bewusst einfach, damit Nadja sich das Passwort merken kann. */
export function passwordPolicyError(plain: string): string | null {
  if (plain.length < 10) return 'Das Passwort muss mindestens 10 Zeichen haben.';
  return null;
}
