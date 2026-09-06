/**
 * Répétition espacée.
 *
 * Variante simplifiée de SM-2, adaptée à un apprentissage par notions plutôt
 * que par cartes : chaque « concept » (un mot, un point de grammaire) porte une
 * facilité, un intervalle et une date de prochaine révision. Une erreur remet
 * l'intervalle à zéro et fait baisser la facilité, donc la notion revient vite.
 */

export interface ConceptMemory {
  conceptId: string;
  /** Facilité — 1.3 (difficile) à 2.8 (facile). */
  ease: number;
  /** Intervalle courant, en jours. */
  interval: number;
  repetitions: number;
  lapses: number;
  attempts: number;
  correct: number;
  lastReviewedAt: number;
  dueAt: number;
}

export const DAY_MS = 86_400_000;

export function newMemory(conceptId: string, now = Date.now()): ConceptMemory {
  return {
    conceptId,
    ease: 2.4,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    attempts: 0,
    correct: 0,
    lastReviewedAt: now,
    dueAt: now,
  };
}

/** `quality` : 0 = échec · 1 = juste avec effort (faute de frappe, indice) · 2 = juste. */
export function review(memory: ConceptMemory, quality: 0 | 1 | 2, now = Date.now()): ConceptMemory {
  const m = { ...memory, attempts: memory.attempts + 1, lastReviewedAt: now };

  if (quality === 0) {
    m.lapses += 1;
    m.repetitions = 0;
    m.interval = 0;
    m.ease = clampEase(m.ease - 0.25);
    // Revient dans la même session ou le lendemain au plus tard.
    m.dueAt = now + 10 * 60 * 1000;
    return m;
  }

  m.correct += 1;
  m.repetitions += 1;
  m.ease = clampEase(m.ease + (quality === 2 ? 0.06 : -0.05));

  if (m.repetitions === 1) m.interval = 1;
  else if (m.repetitions === 2) m.interval = 3;
  else m.interval = Math.round(m.interval * m.ease);

  m.interval = Math.min(m.interval, 180);
  m.dueAt = now + m.interval * DAY_MS;
  return m;
}

function clampEase(e: number): number {
  return Math.max(1.3, Math.min(2.8, Number(e.toFixed(3))));
}

export function isDue(memory: ConceptMemory, now = Date.now()): boolean {
  return memory.dueAt <= now;
}

export function masteryOf(memory: ConceptMemory): number {
  if (memory.attempts === 0) return 0;
  const accuracy = memory.correct / memory.attempts;
  const depth = Math.min(1, memory.repetitions / 4);
  return Math.round(Math.max(0, accuracy * 0.7 + depth * 0.3) * 100);
}

/** Notions à revoir, les plus en retard d'abord. */
export function dueConcepts(memories: ConceptMemory[], now = Date.now(), limit = 20): ConceptMemory[] {
  return memories
    .filter((m) => m.attempts > 0 && isDue(m, now))
    .sort((a, b) => a.dueAt - b.dueAt || a.ease - b.ease)
    .slice(0, limit);
}

/** Notions les plus fragiles — sert au rapport de compétences et aux révisions. */
export function weakestConcepts(memories: ConceptMemory[], limit = 10): ConceptMemory[] {
  return memories
    .filter((m) => m.attempts >= 2)
    .sort((a, b) => masteryOf(a) - masteryOf(b))
    .slice(0, limit);
}
