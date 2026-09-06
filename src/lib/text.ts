/** Normalisation de texte partagée par le moteur (correction) et la recherche. */

const SMART_QUOTES = /[‘’‛′]/g;
/** Marques diacritiques combinantes U+0300–U+036F. */
const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(SMART_QUOTES, "'")
    .normalize('NFD')
    .replace(COMBINING, '')
    .replace(/[.,!?;:"“”()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distance de Levenshtein bornée — sert à détecter la faute de frappe. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Tolérance : 1 faute pour ≤ 8 caractères, 2 au-delà. */
export function isTypoMatch(given: string, expected: string): boolean {
  const g = normalize(given);
  const e = normalize(expected);
  if (!g || !e) return false;
  const budget = e.length <= 8 ? 1 : 2;
  return levenshtein(g, e) <= budget;
}

export function tokenizeWords(sentence: string): string[] {
  return sentence
    .replace(SMART_QUOTES, "'")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
