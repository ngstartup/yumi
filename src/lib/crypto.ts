/** Hachage de mot de passe côté client.
 *
 *  Dans le MVP local-first il n'y a pas de serveur : le mot de passe est donc
 *  dérivé (PBKDF2-SHA256, 150 000 itérations) et seul le condensat est stocké.
 *  Lors de la bascule sur Supabase, l'authentification passera par Supabase Auth
 *  et ce module ne servira plus qu'aux comptes hors ligne. */

const ITERATIONS = 150_000;

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomSalt(): string {
  return randomId();
}

const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (!subtle) return `fallback$${simpleHash(password + salt)}`;
  try {
    const enc = new TextEncoder();
    const key = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
      key,
      256
    );
    return `pbkdf2$${ITERATIONS}$${toHex(bits)}`;
  } catch {
    return `fallback$${simpleHash(password + salt)}`;
  }
}

export async function verifyPassword(password: string, salt: string, expected: string): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  if (actual.length !== expected.length) return false;
  // Comparaison à temps constant.
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function simpleHash(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + s.charCodeAt(i), 2246822519) >>> 0;
  }
  return (h1.toString(16) + h2.toString(16)).padStart(16, '0');
}

/** Identifiant lisible pour les certificats : YUMI-B1-7K3F2A */
export function certificateId(level: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `YUMI-${level}-${s}`;
}
