import { PLACEMENT_BANK, PLACEMENT_LADDER, type PlacementQuestion } from '@/content/placement';
import type { CEFR, SkillKey } from '@/content/types';
import { CEFR_ORDER } from '@/content/types';

/**
 * Test de placement adaptatif.
 *
 * On démarre au milieu de l'échelle (A2). Deux bonnes réponses consécutives
 * font monter d'un cran, deux erreurs consécutives font descendre. Le test
 * s'arrête après `maxQuestions` ou quand l'estimation se stabilise.
 */

export interface PlacementState {
  askedIds: string[];
  answers: { questionId: string; level: CEFR; skill: SkillKey; correct: boolean }[];
  currentLevelIndex: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  finished: boolean;
}

export const PLACEMENT_MAX_QUESTIONS = 12;

export function startPlacement(): PlacementState {
  return {
    askedIds: [],
    answers: [],
    currentLevelIndex: 1, // A2
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    finished: false,
  };
}

export function nextQuestion(state: PlacementState): PlacementQuestion | null {
  if (state.finished || state.answers.length >= PLACEMENT_MAX_QUESTIONS) return null;

  const asked = new Set(state.askedIds);
  const targetLevel = PLACEMENT_LADDER[clampIndex(state.currentLevelIndex)];

  // On cherche d'abord au niveau visé, puis on élargit autour.
  const order = [0, -1, 1, -2, 2];
  const skillCounts = countSkills(state);

  for (const offset of order) {
    const level = PLACEMENT_LADDER[clampIndex(state.currentLevelIndex + offset)];
    const pool = PLACEMENT_BANK.filter((q) => q.level === level && !asked.has(q.id));
    if (pool.length === 0) continue;
    // Priorité à la compétence la moins évaluée jusqu'ici : le rapport final
    // doit couvrir vocabulaire, grammaire, lecture et écoute.
    pool.sort((a, b) => (skillCounts[a.skill] ?? 0) - (skillCounts[b.skill] ?? 0));
    return pool[0];
  }

  const anyLeft = PLACEMENT_BANK.filter((q) => !asked.has(q.id) && q.level === targetLevel);
  return anyLeft[0] ?? null;
}

export function submitAnswer(
  state: PlacementState,
  question: PlacementQuestion,
  choice: number
): PlacementState {
  const correct = choice === question.answer;
  const next: PlacementState = {
    ...state,
    askedIds: [...state.askedIds, question.id],
    answers: [
      ...state.answers,
      { questionId: question.id, level: question.level, skill: question.skill, correct },
    ],
    consecutiveCorrect: correct ? state.consecutiveCorrect + 1 : 0,
    consecutiveWrong: correct ? 0 : state.consecutiveWrong + 1,
    currentLevelIndex: state.currentLevelIndex,
    finished: false,
  };

  if (next.consecutiveCorrect >= 2) {
    next.currentLevelIndex = clampIndex(state.currentLevelIndex + 1);
    next.consecutiveCorrect = 0;
  } else if (next.consecutiveWrong >= 2) {
    next.currentLevelIndex = clampIndex(state.currentLevelIndex - 1);
    next.consecutiveWrong = 0;
  }

  next.finished = next.answers.length >= PLACEMENT_MAX_QUESTIONS || nextQuestion(next) === null;
  return next;
}

export interface PlacementResult {
  level: CEFR;
  scorePercent: number;
  bySkill: Partial<Record<SkillKey, { level: CEFR; percent: number; asked: number }>>;
  strengths: SkillKey[];
  weaknesses: SkillKey[];
  answered: number;
}

export function computeResult(state: PlacementState): PlacementResult {
  const answered = state.answers.length;
  if (answered === 0) {
    return { level: 'A1', scorePercent: 0, bySkill: {}, strengths: [], weaknesses: [], answered: 0 };
  }

  const correct = state.answers.filter((a) => a.correct).length;
  const scorePercent = Math.round((correct / answered) * 100);

  // Niveau estimé : le niveau le plus élevé où l'apprenant réussit au moins 60 %,
  // borné par la moyenne pondérée des réponses justes.
  let estimated: CEFR = 'A1';
  for (const level of PLACEMENT_LADDER) {
    const atLevel = state.answers.filter((a) => a.level === level);
    if (atLevel.length === 0) continue;
    const rate = atLevel.filter((a) => a.correct).length / atLevel.length;
    if (rate >= 0.6) estimated = level;
  }
  // Un score global faible ne peut pas donner un niveau élevé.
  if (scorePercent < 40 && CEFR_ORDER.indexOf(estimated) > 0) {
    estimated = CEFR_ORDER[Math.max(0, CEFR_ORDER.indexOf(estimated) - 1)];
  }

  const bySkill: PlacementResult['bySkill'] = {};
  const skills = [...new Set(state.answers.map((a) => a.skill))];
  for (const skill of skills) {
    const rows = state.answers.filter((a) => a.skill === skill);
    const pct = Math.round((rows.filter((r) => r.correct).length / rows.length) * 100);
    const highest = rows
      .filter((r) => r.correct)
      .reduce<CEFR>((acc, r) => (CEFR_ORDER.indexOf(r.level) > CEFR_ORDER.indexOf(acc) ? r.level : acc), 'A1');
    bySkill[skill] = { level: highest, percent: pct, asked: rows.length };
  }

  const ranked = skills
    .map((s) => ({ s, pct: bySkill[s]?.percent ?? 0 }))
    .sort((a, b) => b.pct - a.pct);

  return {
    level: estimated,
    scorePercent,
    bySkill,
    strengths: ranked.filter((r) => r.pct >= 60).slice(0, 2).map((r) => r.s),
    weaknesses: ranked.filter((r) => r.pct < 60).slice(-2).map((r) => r.s),
    answered,
  };
}

function countSkills(state: PlacementState): Partial<Record<SkillKey, number>> {
  const out: Partial<Record<SkillKey, number>> = {};
  for (const a of state.answers) out[a.skill] = (out[a.skill] ?? 0) + 1;
  return out;
}

function clampIndex(i: number): number {
  return Math.max(0, Math.min(PLACEMENT_LADDER.length - 1, i));
}
