import { create } from 'zustand';
import { getLesson, getUnit, TRACKS, type CEFR, type SkillKey, type TrackKey } from '@/content';
import { getRepository } from '@/data';
import { normalizeSettings } from '@/data/schema';
import type {
  AttemptRecord,
  CertificateRecord,
  DailyRecord,
  LessonProgressRecord,
  MemoryRecord,
  OfflineContentRecord,
  ProfileRecord,
  SettingsRecord,
  UserRecord,
  XpRecord,
} from '@/data/schema';
import { evaluateBadges, type BadgeSnapshot } from '@/engine/badges';
import { newMemory, review, type ConceptMemory } from '@/engine/srs';
import { dayKey, effectiveStreak, emptyStreak, registerActivity, type StreakState } from '@/engine/streak';
import { computeLessonXp, goalXp, type XpEvent } from '@/engine/xp';
import type { Exercise } from '@/engine/types';
import { localAuth } from '@/auth/localAuth';
import { certificateId, randomId } from '@/lib/crypto';
import { configureFeedback, DEFAULT_FEEDBACK } from '@/lib/feedback';
import { setVoicePace, VOICE_PACE_RATES } from '@/lib/audioClips';
import { track } from '@/lib/analytics';

export interface SessionOutcome {
  exercise: Exercise;
  correct: boolean;
  nearMiss: boolean;
  answer: string;
  durationMs: number;
}

export interface SessionSummary {
  xpEvents: XpEvent[];
  xpTotal: number;
  accuracy: number;
  correct: number;
  total: number;
  newWords: number;
  grammarTopics: string[];
  durationMs: number;
  newBadges: string[];
  goalReached: boolean;
  goalJustReached: boolean;
  streak: number;
  progressGain: number;
  perfect: boolean;
}

interface Totals {
  xp: number;
  lessonsCompleted: number;
  unitsCompleted: number;
  exercisesAnswered: number;
  exercisesCorrect: number;
  wordsLearned: number;
  timeMs: number;
  perfectLessons: number;
  assessmentsPassed: number;
}

interface AppState {
  status: 'loading' | 'anonymous' | 'authenticated';
  user: UserRecord | null;
  profile: ProfileRecord | null;
  settings: SettingsRecord | null;
  lessonProgress: Record<string, LessonProgressRecord>;
  memories: Record<string, MemoryRecord>;
  daily: DailyRecord | null;
  dailyHistory: DailyRecord[];
  streak: StreakState;
  badges: string[];
  certificates: CertificateRecord[];
  offlineUnits: string[];
  totals: Totals;
  online: boolean;
  pendingSync: number;
  persistent: boolean;

  bootstrap: () => Promise<void>;
  signUp: (input: { email: string; password: string; firstName: string; lastName?: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<ProfileRecord>) => Promise<void>;
  updateSettings: (patch: Partial<SettingsRecord>) => Promise<void>;
  completeSession: (input: {
    lessonId: string;
    outcomes: SessionOutcome[];
    durationMs: number;
    isReview?: boolean;
    isAssessment?: boolean;
  }) => Promise<SessionSummary>;
  issueCertificate: (input: {
    trackId: TrackKey;
    level: CEFR;
    overallScore: number;
    skillScores: Partial<Record<SkillKey, number>>;
  }) => Promise<CertificateRecord>;
  toggleOfflineUnit: (unitId: string, trackId: TrackKey) => Promise<boolean>;
  setOnline: (online: boolean) => void;
  flushSync: () => Promise<number>;
  exportData: () => Promise<Record<string, unknown>>;
  resetProgress: () => Promise<void>;
}

const emptyTotals: Totals = {
  xp: 0,
  lessonsCompleted: 0,
  unitsCompleted: 0,
  exercisesAnswered: 0,
  exercisesCorrect: 0,
  wordsLearned: 0,
  timeMs: 0,
  perfectLessons: 0,
  assessmentsPassed: 0,
};

export const useApp = create<AppState>((set, get) => ({
  status: 'loading',
  user: null,
  profile: null,
  settings: null,
  lessonProgress: {},
  memories: {},
  daily: null,
  dailyHistory: [],
  streak: emptyStreak(),
  badges: [],
  certificates: [],
  offlineUnits: [],
  totals: emptyTotals,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  pendingSync: 0,
  persistent: true,

  async bootstrap() {
    try {
      const repo = await getRepository();
      set({ persistent: repo.persistent });
      const session = await localAuth.restore();
      if (!session) {
        set({ status: 'anonymous' });
        return;
      }
      await hydrate(set, session.user, session.profile);
    } catch (err) {
      console.error('[yumi] bootstrap failed', err);
      set({ status: 'anonymous' });
    }
  },

  async signUp(input) {
    const { user, profile } = await localAuth.signUp(input);
    track('signup');
    await hydrate(set, user, profile);
  },

  async signIn(input) {
    const { user, profile } = await localAuth.signIn(input);
    track('signin');
    await hydrate(set, user, profile);
  },

  async signOut() {
    await localAuth.signOut();
    configureFeedback(DEFAULT_FEEDBACK);
    set({
      status: 'anonymous',
      user: null,
      profile: null,
      settings: null,
      lessonProgress: {},
      memories: {},
      daily: null,
      dailyHistory: [],
      streak: emptyStreak(),
      badges: [],
      certificates: [],
      offlineUnits: [],
      totals: emptyTotals,
    });
  },

  async updateProfile(patch) {
    const { profile } = get();
    if (!profile) return;
    const next = { ...profile, ...patch, updatedAt: Date.now() };
    set({ profile: next });
    const repo = await getRepository();
    await repo.saveProfile(next);
    await repo.enqueue({
      userId: next.userId,
      entity: 'profiles',
      op: 'upsert',
      payload: next,
      createdAt: Date.now(),
    });
    set({ pendingSync: await repo.pendingCount(next.userId) });
  },

  async updateSettings(patch) {
    const { settings, user } = get();
    if (!settings || !user) return;
    const next = { ...settings, ...patch, updatedAt: Date.now() };
    set({ settings: next });
    applyFeedbackSettings(next);
    const repo = await getRepository();
    await repo.saveSettings(next);
  },

  async completeSession({ lessonId, outcomes, durationMs, isReview = false, isAssessment = false }) {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('not-authenticated');
    const repo = await getRepository();
    const now = Date.now();
    const today = dayKey(now);

    const correct = outcomes.filter((o) => o.correct).length;
    const nearMiss = outcomes.filter((o) => o.correct && o.nearMiss).length;
    const total = outcomes.length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const maxCombo = longestStreak(outcomes.map((o) => o.correct));

    // ---- Tentatives -------------------------------------------------------
    const attempts: AttemptRecord[] = outcomes.map((o) => ({
      id: randomId(),
      userId: user.id,
      lessonId,
      exerciseId: o.exercise.id,
      conceptId: o.exercise.conceptId,
      exerciseType: o.exercise.type,
      skill: o.exercise.skill,
      correct: o.correct,
      nearMiss: o.nearMiss,
      answer: o.answer.slice(0, 200),
      durationMs: o.durationMs,
      createdAt: now,
    }));
    await repo.appendAttempts(attempts);

    // ---- Répétition espacée ----------------------------------------------
    const memories = { ...state.memories };
    for (const o of outcomes) {
      const key = o.exercise.conceptId;
      const existing: ConceptMemory =
        memories[key] ?? { ...newMemory(key, now) };
      const quality: 0 | 1 | 2 = o.correct ? (o.nearMiss ? 1 : 2) : 0;
      const updated = review(existing, quality, now);
      memories[key] = {
        ...updated,
        id: `${user.id}:${key}`,
        userId: user.id,
        lessonId,
        skill: o.exercise.skill,
      };
    }
    await repo.saveMemories(Object.values(memories).filter((m) => m.userId === user.id));

    // ---- XP ---------------------------------------------------------------
    const { events, total: xpTotal } = computeLessonXp({
      correct,
      nearMiss,
      total,
      maxCombo,
      isAssessment,
      isReview,
    });

    // ---- Objectif du jour -------------------------------------------------
    const targetXp = goalXp(state.profile?.dailyGoal ?? 'regular');
    const prevDaily =
      state.daily?.day === today
        ? state.daily
        : (await repo.getDaily(user.id, today)) ?? {
            id: `${user.id}:${today}`,
            userId: user.id,
            day: today,
            xp: 0,
            lessonsCompleted: 0,
            exercisesAnswered: 0,
            correctAnswers: 0,
            timeMs: 0,
            goalXp: targetXp,
            goalReached: false,
          };

    const wasReached = prevDaily.goalReached;
    let dailyXp = prevDaily.xp + xpTotal;
    const goalReached = dailyXp >= targetXp;
    const goalJustReached = goalReached && !wasReached;
    const xpEvents = [...events];
    if (goalJustReached) {
      xpEvents.push({ reason: 'daily_goal', amount: 25 });
      dailyXp += 25;
      track('daily_goal_reached', { xp: dailyXp });
    }
    const grandXp = xpEvents.reduce((n, e) => n + e.amount, 0);

    const daily: DailyRecord = {
      ...prevDaily,
      goalXp: targetXp,
      xp: dailyXp,
      lessonsCompleted: prevDaily.lessonsCompleted + (isReview ? 0 : 1),
      exercisesAnswered: prevDaily.exercisesAnswered + total,
      correctAnswers: prevDaily.correctAnswers + correct,
      timeMs: prevDaily.timeMs + durationMs,
      goalReached,
    };
    await repo.saveDaily(daily);

    const xpRows: XpRecord[] = xpEvents.map((e) => ({
      id: randomId(),
      userId: user.id,
      amount: e.amount,
      reason: e.reason,
      lessonId,
      day: today,
      createdAt: now,
    }));
    await repo.appendXp(xpRows);

    // ---- Progression de la leçon -----------------------------------------
    const lesson = getLesson(lessonId);
    const lessonProgress = { ...state.lessonProgress };
    if (lesson && !isReview) {
      const prev = lessonProgress[lessonId];
      const row: LessonProgressRecord = {
        id: `${user.id}:${lessonId}`,
        userId: user.id,
        lessonId,
        unitId: lesson.unitId,
        trackId: lesson.trackId,
        status: 'completed',
        bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
        timesCompleted: (prev?.timesCompleted ?? 0) + 1,
        lastScore: accuracy,
        totalTimeMs: (prev?.totalTimeMs ?? 0) + durationMs,
        completedAt: now,
        updatedAt: now,
      };
      lessonProgress[lessonId] = row;
      await repo.saveLessonProgress(row);
      await repo.saveTrackProgress({
        id: `${user.id}:${lesson.trackId}`,
        userId: user.id,
        trackId: lesson.trackId,
        startedAt: now,
        lastLessonId: lessonId,
        updatedAt: now,
      });
      await repo.enqueue({
        userId: user.id,
        entity: 'lesson_progress',
        op: 'upsert',
        payload: row,
        createdAt: now,
      });
    }

    // ---- Série ------------------------------------------------------------
    const streak = registerActivity(state.streak, now);
    await repo.saveStreak({ ...streak, userId: user.id, updatedAt: now });

    // ---- Totaux et badges -------------------------------------------------
    const perfect = total > 0 && correct === total;
    const totals: Totals = {
      xp: state.totals.xp + grandXp,
      lessonsCompleted: state.totals.lessonsCompleted + (isReview ? 0 : 1),
      unitsCompleted: countCompletedUnits(lessonProgress),
      exercisesAnswered: state.totals.exercisesAnswered + total,
      exercisesCorrect: state.totals.exercisesCorrect + correct,
      wordsLearned: countWordsLearned(memories),
      timeMs: state.totals.timeMs + durationMs,
      perfectLessons: state.totals.perfectLessons + (perfect && !isReview ? 1 : 0),
      assessmentsPassed: state.totals.assessmentsPassed + (isAssessment && accuracy >= 70 ? 1 : 0),
    };

    const snapshot: BadgeSnapshot = {
      totalXp: totals.xp,
      lessonsCompleted: totals.lessonsCompleted,
      unitsCompleted: totals.unitsCompleted,
      exercisesCorrect: totals.exercisesCorrect,
      wordsLearned: totals.wordsLearned,
      streakCurrent: streak.current,
      levelsCompleted: completedLevels(lessonProgress),
      assessmentsPassed: totals.assessmentsPassed,
      perfectLessons: totals.perfectLessons,
      lastActivityHour: new Date(now).getHours(),
    };
    const newBadges = evaluateBadges(snapshot, state.badges);
    if (newBadges.length > 0) {
      await repo.awardBadges(
        newBadges.map((b) => ({ id: `${user.id}:${b}`, userId: user.id, badgeId: b, earnedAt: now }))
      );
    }

    const dailyHistory = [...state.dailyHistory.filter((d) => d.day !== today), daily];

    set({
      memories,
      daily,
      dailyHistory,
      streak,
      lessonProgress,
      totals,
      badges: [...state.badges, ...newBadges],
      pendingSync: await repo.pendingCount(user.id),
    });

    track(isReview ? 'review_started' : 'lesson_completed', { lessonId, accuracy, xp: grandXp });
    if (isAssessment) track('assessment_completed', { accuracy });

    return {
      xpEvents,
      xpTotal: grandXp,
      accuracy,
      correct,
      total,
      newWords: countNewWords(outcomes, state.memories),
      grammarTopics: uniqueGrammarTopics(outcomes),
      durationMs,
      newBadges,
      goalReached,
      goalJustReached,
      streak: streak.current,
      progressGain: lesson ? Math.round((1 / Math.max(1, trackLessonCount(lesson.trackId))) * 100) : 0,
      perfect,
    };
  },

  async issueCertificate({ trackId, level, overallScore, skillScores }) {
    const { user, profile } = get();
    if (!user || !profile) throw new Error('not-authenticated');
    const repo = await getRepository();
    const record: CertificateRecord = {
      id: certificateId(level),
      userId: user.id,
      trackId,
      level,
      overallScore,
      skillScores,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      issuedAt: Date.now(),
    };
    await repo.saveCertificate(record);
    set({ certificates: [...get().certificates, record] });
    return record;
  },

  async toggleOfflineUnit(unitId, trackId) {
    const { user, offlineUnits } = get();
    if (!user) return false;
    const repo = await getRepository();
    const id = `${user.id}:${unitId}`;
    if (offlineUnits.includes(unitId)) {
      await repo.removeOffline(id);
      set({ offlineUnits: offlineUnits.filter((u) => u !== unitId) });
      return false;
    }
    const unit = getUnit(unitId);
    const row: OfflineContentRecord = {
      id,
      userId: user.id,
      unitId,
      trackId,
      downloadedAt: Date.now(),
      sizeEstimate: (unit?.lessons.length ?? 1) * 12_000,
    };
    await repo.saveOffline(row);
    set({ offlineUnits: [...offlineUnits, unitId] });
    track('offline_download', { unitId });
    return true;
  },

  setOnline(online) {
    set({ online });
    if (online) void get().flushSync();
  },

  async flushSync() {
    const { user } = get();
    if (!user) return 0;
    const repo = await getRepository();
    // En local-first il n'y a pas encore de serveur : on vide la file et on
    // journalise. Avec Supabase, chaque entrée sera rejouée via l'adaptateur.
    const rows = await repo.drainQueue(user.id);
    set({ pendingSync: 0 });
    if (rows.length > 0) track('sync_flushed', { count: rows.length });
    return rows.length;
  },

  async exportData() {
    const { user } = get();
    if (!user) return {};
    const repo = await getRepository();
    return repo.exportAll(user.id);
  },

  async resetProgress() {
    const { user, profile } = get();
    if (!user || !profile) return;
    const repo = await getRepository();
    await repo.clearUserData(user.id);
    await repo.saveProfile({ ...profile, level: 'A1', placementDone: false, updatedAt: Date.now() });
    set({
      lessonProgress: {},
      memories: {},
      daily: null,
      dailyHistory: [],
      streak: emptyStreak(),
      badges: [],
      certificates: [],
      offlineUnits: [],
      totals: emptyTotals,
      profile: { ...profile, level: 'A1', placementDone: false, updatedAt: Date.now() },
    });
  },
}));

// ---------------------------------------------------------------------------
// Chargement
// ---------------------------------------------------------------------------

type Setter = (partial: Partial<AppState>) => void;

async function hydrate(set: Setter, user: UserRecord, profile: ProfileRecord) {
  const repo = await getRepository();
  const [settings, lessons, memories, dailyRows, streakRow, badgeRows, certs, offline, xpRows] =
    await Promise.all([
      repo.getSettings(user.id),
      repo.listLessonProgress(user.id),
      repo.listMemories(user.id),
      repo.listDaily(user.id),
      repo.getStreak(user.id),
      repo.listBadges(user.id),
      repo.listCertificates(user.id),
      repo.listOffline(user.id),
      repo.listXp(user.id),
    ]);

  const normalizedSettings = normalizeSettings(user.id, settings);
  applyFeedbackSettings(normalizedSettings);

  const lessonProgress: Record<string, LessonProgressRecord> = {};
  for (const l of lessons) lessonProgress[l.lessonId] = l;

  const memoryMap: Record<string, MemoryRecord> = {};
  for (const m of memories) memoryMap[m.conceptId] = m;

  const today = dayKey();
  const streak: StreakState = streakRow
    ? { current: streakRow.current, best: streakRow.best, lastActiveDay: streakRow.lastActiveDay, history: streakRow.history }
    : emptyStreak();

  const totals: Totals = {
    xp: xpRows.reduce((n, r) => n + r.amount, 0),
    lessonsCompleted: lessons.filter((l) => l.status === 'completed').length,
    unitsCompleted: countCompletedUnits(lessonProgress),
    exercisesAnswered: dailyRows.reduce((n, d) => n + d.exercisesAnswered, 0),
    exercisesCorrect: dailyRows.reduce((n, d) => n + d.correctAnswers, 0),
    wordsLearned: countWordsLearned(memoryMap),
    timeMs: dailyRows.reduce((n, d) => n + d.timeMs, 0),
    perfectLessons: lessons.filter((l) => l.bestAccuracy === 100).length,
    assessmentsPassed: certs.length,
  };

  set({
    status: 'authenticated',
    user,
    profile,
    settings: normalizedSettings,
    lessonProgress,
    memories: memoryMap,
    daily: dailyRows.find((d) => d.day === today) ?? null,
    dailyHistory: dailyRows,
    streak: { ...streak, current: effectiveStreak(streak) },
    badges: badgeRows.map((b) => b.badgeId),
    certificates: certs,
    offlineUnits: offline.map((o) => o.unitId),
    totals,
    pendingSync: await repo.pendingCount(user.id),
    persistent: repo.persistent,
  });
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/** Un seul endroit relie les réglages de l'utilisateur au service sensoriel. */
function applyFeedbackSettings(settings: SettingsRecord) {
  configureFeedback({
    sound: settings.soundEnabled,
    volume: settings.soundVolume,
    haptics: settings.hapticsEnabled,
    intensity: settings.hapticsIntensity,
  });
  setVoicePace(VOICE_PACE_RATES[settings.voicePace] ?? 1);
}

function longestStreak(values: boolean[]): number {
  let best = 0;
  let cur = 0;
  for (const v of values) {
    cur = v ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}

function countWordsLearned(memories: Record<string, MemoryRecord>): number {
  return Object.values(memories).filter((m) => m.skill === 'vocabulary' && m.correct > 0).length;
}

function countNewWords(outcomes: SessionOutcome[], before: Record<string, MemoryRecord>): number {
  const ids = new Set(
    outcomes
      .filter((o) => o.exercise.skill === 'vocabulary' && o.correct)
      .map((o) => o.exercise.conceptId)
  );
  return [...ids].filter((id) => !before[id] || before[id].correct === 0).length;
}

/**
 * Les notions de grammaire rencontrées, sous leur nom.
 *
 * On lit `concept`, le libellé, et jamais `conceptId` : celui-ci est un
 * identifiant technique (`age-with-be`, `gen-a1-u1-l3-s2`) qui n'a rien à faire
 * sous les yeux d'un apprenant. Un exercice de grammaire dérivé d'une phrase
 * modèle n'a pas de point de grammaire nommé — il est simplement absent de la
 * liste, ce qui vaut mieux que d'y figurer sous un matricule.
 */
function uniqueGrammarTopics(outcomes: SessionOutcome[]): string[] {
  const named = outcomes
    .filter((o) => o.exercise.skill === 'grammar')
    .map((o) => o.exercise.concept)
    .filter((label): label is string => Boolean(label && label.trim()));
  return [...new Set(named)];
}

function countCompletedUnits(progress: Record<string, LessonProgressRecord>): number {
  const byUnit = new Map<string, number>();
  for (const p of Object.values(progress)) {
    if (p.status === 'completed') byUnit.set(p.unitId, (byUnit.get(p.unitId) ?? 0) + 1);
  }
  let n = 0;
  for (const [unitId, done] of byUnit) {
    const unit = getUnit(unitId);
    if (unit && done >= unit.lessons.length) n++;
  }
  return n;
}

function completedLevels(progress: Record<string, LessonProgressRecord>): string[] {
  const out: string[] = [];
  for (const trackKey of Object.keys(TRACKS) as TrackKey[]) {
    for (const block of TRACKS[trackKey].levels) {
      const all = block.sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
      if (all.length > 0 && all.every((l) => progress[l.id]?.status === 'completed')) {
        out.push(block.level);
      }
    }
  }
  return [...new Set(out)];
}

function trackLessonCount(trackId: TrackKey): number {
  return TRACKS[trackId].levels.reduce(
    (n, b) => n + b.sections.reduce((m, s) => m + s.units.reduce((k, u) => k + u.lessons.length, 0), 0),
    0
  );
}
