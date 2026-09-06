/** Barème d'XP — centralisé pour être ajustable sans toucher au reste. */
export const XP_RULES = {
  correctAnswer: 2,
  nearMissAnswer: 1,
  lessonComplete: 10,
  perfectLessonBonus: 8,
  comboThreshold: 5,
  comboBonus: 5,
  assessmentPassed: 20,
  dailyGoalReached: 25,
  reviewSessionComplete: 8,
} as const;

export type XpReason =
  | 'correct_answer'
  | 'near_miss'
  | 'lesson_complete'
  | 'perfect_lesson'
  | 'combo'
  | 'assessment'
  | 'daily_goal'
  | 'review_session';

export interface XpEvent {
  reason: XpReason;
  amount: number;
}

/** XP d'une session de leçon, détaillé pour l'écran de fin. */
export function computeLessonXp(params: {
  correct: number;
  nearMiss: number;
  total: number;
  maxCombo: number;
  isAssessment?: boolean;
  isReview?: boolean;
}): { events: XpEvent[]; total: number } {
  const events: XpEvent[] = [];
  const pureCorrect = Math.max(0, params.correct - params.nearMiss);

  if (pureCorrect > 0) {
    events.push({ reason: 'correct_answer', amount: pureCorrect * XP_RULES.correctAnswer });
  }
  if (params.nearMiss > 0) {
    events.push({ reason: 'near_miss', amount: params.nearMiss * XP_RULES.nearMissAnswer });
  }
  if (params.isReview) {
    events.push({ reason: 'review_session', amount: XP_RULES.reviewSessionComplete });
  } else {
    events.push({ reason: 'lesson_complete', amount: XP_RULES.lessonComplete });
  }
  if (params.maxCombo >= XP_RULES.comboThreshold) {
    const bonuses = Math.floor(params.maxCombo / XP_RULES.comboThreshold);
    events.push({ reason: 'combo', amount: bonuses * XP_RULES.comboBonus });
  }
  if (params.total > 0 && params.correct === params.total && !params.isReview) {
    events.push({ reason: 'perfect_lesson', amount: XP_RULES.perfectLessonBonus });
  }
  if (params.isAssessment && params.total > 0 && params.correct / params.total >= 0.7) {
    events.push({ reason: 'assessment', amount: XP_RULES.assessmentPassed });
  }

  return { events, total: events.reduce((n, e) => n + e.amount, 0) };
}

/** Objectifs quotidiens proposés à l'inscription. */
export const DAILY_GOALS = [
  { id: 'light', xp: 10 },
  { id: 'regular', xp: 30 },
  { id: 'serious', xp: 50 },
  { id: 'intense', xp: 80 },
] as const;

export type DailyGoalId = (typeof DAILY_GOALS)[number]['id'];

export function goalXp(id: DailyGoalId): number {
  return DAILY_GOALS.find((g) => g.id === id)?.xp ?? 30;
}
