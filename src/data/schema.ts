import type { CEFR, SkillKey, TrackKey } from '@/content/types';
import type { ConceptMemory } from '@/engine/srs';
import { DEFAULT_FEEDBACK, type HapticIntensity } from '@/lib/feedback';
import type { StreakState } from '@/engine/streak';
import type { DailyGoalId } from '@/engine/xp';
import type { Locale } from '@/i18n/types';

/** Entités persistées. Les noms reprennent ceux du schéma SQL Supabase
 *  (supabase/schema.sql) pour que la bascule locale → cloud soit mécanique. */

export interface UserRecord {
  id: string;
  email: string;
  /** PBKDF2-SHA256, jamais le mot de passe en clair. */
  passwordHash: string;
  passwordSalt: string;
  createdAt: number;
}

export type LearningGoal = 'general' | 'business' | 'academic' | 'travel' | 'interview';

export interface ProfileRecord {
  userId: string;
  firstName: string;
  lastName: string;
  avatarSeed: string;
  locale: Locale;
  goal: LearningGoal;
  level: CEFR;
  activeTrack: TrackKey;
  dailyGoal: DailyGoalId;
  placementDone: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SettingsRecord {
  userId: string;
  notificationsEnabled: boolean;
  reminderTime: string;
  /** Sons d'interface (synthétisés, aucun fichier audio). */
  soundEnabled: boolean;
  /** Volume des sons, 0 → 1. */
  soundVolume: number;
  /** Vibrations sur les interactions et les récompenses. */
  hapticsEnabled: boolean;
  hapticsIntensity: HapticIntensity;
  analyticsOptIn: boolean;
  updatedAt: number;
}

/** Valeurs par défaut appliquées à la création d'un compte, et complétées à la
 *  lecture pour les comptes créés avant l'ajout du retour sensoriel. */
export function defaultSettings(userId: string): SettingsRecord {
  return {
    userId,
    notificationsEnabled: false,
    reminderTime: '19:00',
    soundEnabled: DEFAULT_FEEDBACK.sound,
    soundVolume: DEFAULT_FEEDBACK.volume,
    hapticsEnabled: DEFAULT_FEEDBACK.haptics,
    hapticsIntensity: DEFAULT_FEEDBACK.intensity,
    analyticsOptIn: false,
    updatedAt: Date.now(),
  };
}

export function normalizeSettings(
  userId: string,
  stored: Partial<SettingsRecord> | undefined
): SettingsRecord {
  const base = defaultSettings(userId);
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    userId,
    soundVolume:
      typeof stored.soundVolume === 'number' && Number.isFinite(stored.soundVolume)
        ? Math.max(0, Math.min(1, stored.soundVolume))
        : base.soundVolume,
    hapticsEnabled:
      typeof stored.hapticsEnabled === 'boolean' ? stored.hapticsEnabled : base.hapticsEnabled,
    hapticsIntensity: (['light', 'medium', 'strong'] as const).includes(
      stored.hapticsIntensity as HapticIntensity
    )
      ? (stored.hapticsIntensity as HapticIntensity)
      : base.hapticsIntensity,
  };
}

export interface TrackProgressRecord {
  id: string; // `${userId}:${trackId}`
  userId: string;
  trackId: TrackKey;
  startedAt: number;
  lastLessonId: string | null;
  updatedAt: number;
}

export interface LessonProgressRecord {
  id: string; // `${userId}:${lessonId}`
  userId: string;
  lessonId: string;
  unitId: string;
  trackId: TrackKey;
  status: 'in_progress' | 'completed';
  bestAccuracy: number;
  timesCompleted: number;
  lastScore: number;
  totalTimeMs: number;
  completedAt: number | null;
  updatedAt: number;
}

export interface AttemptRecord {
  id: string;
  userId: string;
  lessonId: string;
  exerciseId: string;
  conceptId: string;
  exerciseType: string;
  skill: SkillKey;
  correct: boolean;
  nearMiss: boolean;
  answer: string;
  durationMs: number;
  createdAt: number;
}

export interface MemoryRecord extends ConceptMemory {
  id: string; // `${userId}:${conceptId}`
  userId: string;
  lessonId: string;
  skill: SkillKey;
}

export interface XpRecord {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  lessonId: string | null;
  day: string;
  createdAt: number;
}

export interface DailyRecord {
  id: string; // `${userId}:${day}`
  userId: string;
  day: string;
  xp: number;
  lessonsCompleted: number;
  exercisesAnswered: number;
  correctAnswers: number;
  timeMs: number;
  goalXp: number;
  goalReached: boolean;
}

export interface StreakRecord extends StreakState {
  userId: string;
  updatedAt: number;
}

export interface UserBadgeRecord {
  id: string; // `${userId}:${badgeId}`
  userId: string;
  badgeId: string;
  earnedAt: number;
}

export interface CertificateRecord {
  id: string; // YUMI-<LEVEL>-XXXXXX
  userId: string;
  trackId: TrackKey;
  level: CEFR;
  overallScore: number;
  skillScores: Partial<Record<SkillKey, number>>;
  fullName: string;
  issuedAt: number;
}

export interface OfflineContentRecord {
  id: string; // `${userId}:${unitId}`
  userId: string;
  unitId: string;
  trackId: TrackKey;
  downloadedAt: number;
  sizeEstimate: number;
}

/** File d'attente de synchronisation — rejouée quand la connexion revient. */
export interface SyncQueueRecord {
  seq?: number;
  userId: string;
  entity: string;
  op: 'upsert' | 'delete';
  payload: unknown;
  createdAt: number;
}

export const STORES = {
  users: 'users',
  profiles: 'profiles',
  settings: 'settings',
  trackProgress: 'trackProgress',
  lessonProgress: 'lessonProgress',
  attempts: 'attempts',
  memories: 'memories',
  xp: 'xp',
  daily: 'daily',
  streaks: 'streaks',
  badges: 'badges',
  certificates: 'certificates',
  offline: 'offline',
  syncQueue: 'syncQueue',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];
