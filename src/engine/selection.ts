import type { CEFR, Lesson } from '@/content/types';
import { CEFR_ORDER } from '@/content/types';
import { getLesson } from '@/content';
import { hashString, makeRng, shuffle } from '@/lib/random';
import { generateExercises } from './generator';
import { masteryOf, type ConceptMemory } from './srs';
import type { Exercise } from './types';

/**
 * Sélection des exercices d'une session.
 *
 * Trois contraintes s'appliquent en même temps :
 *  1. la difficulté doit rester dans la fenêtre du niveau de l'apprenant ;
 *  2. les notions mal maîtrisées sont prioritaires ;
 *  3. la session doit varier les types d'exercices et les compétences.
 */

export interface SelectionInput {
  lesson: Lesson;
  memories: Map<string, ConceptMemory>;
  learnerLevel: CEFR;
  /** Désactive les exercices de prononciation si le micro n'est pas disponible. */
  speechAvailable: boolean;
  seed?: number;
  count?: number;
}

/** Fenêtre de difficulté acceptable pour un niveau donné : jamais de C1 brut
 *  servi à un débutant. */
export function difficultyWindow(level: CEFR): [number, number] {
  const idx = CEFR_ORDER.indexOf(level);
  const center = 1 + idx * 0.8;
  return [Math.max(1, Math.floor(center - 1)), Math.min(5, Math.ceil(center + 1.5))];
}

export function selectExercises(input: SelectionInput): Exercise[] {
  const { lesson, memories, learnerLevel, speechAvailable } = input;
  const seed = input.seed ?? hashString(lesson.id + new Date().toDateString());
  const rng = makeRng(seed);
  const count = input.count ?? lesson.targetExercises;

  const [min, max] = difficultyWindow(learnerLevel);
  const all = generateExercises(lesson, seed).filter(
    (e) => (speechAvailable || e.type !== 'speak') && e.difficulty >= min - 1 && e.difficulty <= max
  );
  if (all.length === 0) return generateExercises(lesson, seed).slice(0, count);

  const scored = all.map((e) => ({ e, score: priority(e, memories, rng()) }));
  scored.sort((a, b) => b.score - a.score);

  // Un seul exercice par item tant que la session n'est pas remplie, pour éviter
  // de poser trois fois le même mot d'affilée.
  const chosen: Exercise[] = [];
  const usedItems = new Set<string>();
  for (const { e } of scored) {
    if (chosen.length >= count) break;
    if (usedItems.has(e.itemId)) continue;
    chosen.push(e);
    usedItems.add(e.itemId);
  }
  for (const { e } of scored) {
    if (chosen.length >= count) break;
    if (chosen.includes(e)) continue;
    chosen.push(e);
  }

  return orderForFlow(chosen, rng);
}

function priority(exercise: Exercise, memories: Map<string, ConceptMemory>, jitter: number): number {
  const m = memories.get(exercise.conceptId);
  let score = jitter * 0.3;
  if (!m || m.attempts === 0) {
    score += 1.0; // notion neuve : à voir en priorité
  } else {
    const mastery = masteryOf(m);
    score += (100 - mastery) / 100; // notion fragile : priorité haute
    if (m.dueAt <= Date.now()) score += 0.6;
    if (m.lapses > 0) score += 0.2 * Math.min(3, m.lapses);
  }
  // Léger bonus aux types productifs, plus formateurs que le QCM.
  if (exercise.type === 'translate' || exercise.type === 'wordOrder') score += 0.15;
  return score;
}

/**
 * Ordre de la session : on commence par un exercice de reconnaissance (moins
 * exigeant), on alterne les compétences, et on garde la production écrite pour
 * le milieu plutôt que la toute fin.
 */
function orderForFlow(exercises: Exercise[], rng: () => number): Exercise[] {
  const easyFirst = [...exercises].sort((a, b) => a.difficulty - b.difficulty);
  if (easyFirst.length <= 2) return easyFirst;

  const opener = easyFirst[0];
  const rest = shuffle(easyFirst.slice(1), rng);

  const out: Exercise[] = [opener];
  let lastSkill = opener.skill;
  const pool = [...rest];
  while (pool.length > 0) {
    const idx = pool.findIndex((e) => e.skill !== lastSkill);
    const next = pool.splice(idx >= 0 ? idx : 0, 1)[0];
    out.push(next);
    lastSkill = next.skill;
  }
  return out;
}

/** Session de révision : reprend les notions dues, quelle que soit la leçon. */
export function buildReviewSession(
  memories: ConceptMemory[],
  conceptToLesson: Map<string, string>,
  learnerLevel: CEFR,
  speechAvailable: boolean,
  limit = 8
): Exercise[] {
  const now = Date.now();
  const due = memories
    .filter((m) => m.attempts > 0 && m.dueAt <= now)
    .sort((a, b) => masteryOf(a) - masteryOf(b))
    .slice(0, limit * 2);

  const [min, max] = difficultyWindow(learnerLevel);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (const m of due) {
    if (out.length >= limit) break;
    const lessonId = conceptToLesson.get(m.conceptId);
    if (!lessonId) continue;
    const lesson = getLesson(lessonId);
    if (!lesson) continue;
    const candidates = generateExercises(lesson, hashString(m.conceptId)).filter(
      (e) =>
        e.conceptId === m.conceptId &&
        (speechAvailable || e.type !== 'speak') &&
        e.difficulty >= min - 1 &&
        e.difficulty <= max
    );
    const chosen = candidates.find((c) => !seen.has(c.id));
    if (chosen) {
      out.push(chosen);
      seen.add(chosen.id);
    }
  }
  return out;
}
