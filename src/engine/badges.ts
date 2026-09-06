/** Catalogue des badges. Ajouter un badge = ajouter une entrée ici. */

export interface BadgeSnapshot {
  totalXp: number;
  lessonsCompleted: number;
  unitsCompleted: number;
  exercisesCorrect: number;
  wordsLearned: number;
  streakCurrent: number;
  levelsCompleted: string[];
  assessmentsPassed: number;
  perfectLessons: number;
  /** Heure locale de la dernière activité (0–23). */
  lastActivityHour: number;
}

export interface BadgeDef {
  id: string;
  /** Clé i18n : badges.<i18nKey>.name / .desc */
  i18nKey: string;
  emoji: string;
  tone: 'blue' | 'sun' | 'mint';
  /** Objectif numérique, quand le badge est progressif. */
  target?: (s: BadgeSnapshot) => number;
  progress?: (s: BadgeSnapshot) => number;
  earned: (s: BadgeSnapshot) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-lesson',
    i18nKey: 'firstLesson',
    emoji: '🌱',
    tone: 'mint',
    earned: (s) => s.lessonsCompleted >= 1,
    progress: (s) => Math.min(1, s.lessonsCompleted),
    target: () => 1,
  },
  {
    id: 'xp-100',
    i18nKey: 'xp100',
    emoji: '⚡',
    tone: 'sun',
    earned: (s) => s.totalXp >= 100,
    progress: (s) => Math.min(100, s.totalXp),
    target: () => 100,
  },
  {
    id: 'xp-1000',
    i18nKey: 'xp1000',
    emoji: '🔋',
    tone: 'sun',
    earned: (s) => s.totalXp >= 1000,
    progress: (s) => Math.min(1000, s.totalXp),
    target: () => 1000,
  },
  {
    id: 'streak-7',
    i18nKey: 'streak7',
    emoji: '🔥',
    tone: 'sun',
    earned: (s) => s.streakCurrent >= 7,
    progress: (s) => Math.min(7, s.streakCurrent),
    target: () => 7,
  },
  {
    id: 'streak-30',
    i18nKey: 'streak30',
    emoji: '🏔️',
    tone: 'blue',
    earned: (s) => s.streakCurrent >= 30,
    progress: (s) => Math.min(30, s.streakCurrent),
    target: () => 30,
  },
  {
    id: 'first-unit',
    i18nKey: 'firstUnit',
    emoji: '🧩',
    tone: 'blue',
    earned: (s) => s.unitsCompleted >= 1,
  },
  {
    id: 'level-a1',
    i18nKey: 'levelA1',
    emoji: '🎯',
    tone: 'mint',
    earned: (s) => s.levelsCompleted.includes('A1'),
  },
  {
    id: 'exercises-100',
    i18nKey: 'exercises100',
    emoji: '💯',
    tone: 'blue',
    earned: (s) => s.exercisesCorrect >= 100,
    progress: (s) => Math.min(100, s.exercisesCorrect),
    target: () => 100,
  },
  {
    id: 'words-500',
    i18nKey: 'words500',
    emoji: '📚',
    tone: 'blue',
    earned: (s) => s.wordsLearned >= 500,
    progress: (s) => Math.min(500, s.wordsLearned),
    target: () => 500,
  },
  {
    id: 'first-assessment',
    i18nKey: 'firstAssessment',
    emoji: '🏅',
    tone: 'sun',
    earned: (s) => s.assessmentsPassed >= 1,
  },
  {
    id: 'perfect-lesson',
    i18nKey: 'perfectLesson',
    emoji: '✨',
    tone: 'mint',
    earned: (s) => s.perfectLessons >= 1,
  },
  {
    id: 'early-bird',
    i18nKey: 'earlyBird',
    emoji: '🌅',
    tone: 'sun',
    earned: (s) => s.lessonsCompleted > 0 && s.lastActivityHour < 8,
  },
  {
    id: 'night-owl',
    i18nKey: 'nightOwl',
    emoji: '🌙',
    tone: 'blue',
    earned: (s) => s.lessonsCompleted > 0 && s.lastActivityHour >= 22,
  },
];

/** Renvoie les identifiants des badges nouvellement obtenus. */
export function evaluateBadges(snapshot: BadgeSnapshot, already: string[]): string[] {
  const owned = new Set(already);
  return BADGES.filter((b) => !owned.has(b.id) && b.earned(snapshot)).map((b) => b.id);
}

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
