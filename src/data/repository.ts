import type {
  AttemptRecord,
  CertificateRecord,
  DailyRecord,
  LessonProgressRecord,
  MemoryRecord,
  OfflineContentRecord,
  ProfileRecord,
  SettingsRecord,
  StreakRecord,
  SyncQueueRecord,
  TrackProgressRecord,
  UserBadgeRecord,
  UserRecord,
  XpRecord,
} from './schema';

/**
 * Contrat de persistance.
 *
 * Toute l'application passe par cette interface — jamais par IndexedDB ni par
 * un client HTTP directement. Brancher Supabase revient donc à fournir une
 * seconde implémentation (voir supabaseRepository.ts) sans toucher à l'UI.
 */
export interface Repository {
  readonly kind: 'local' | 'supabase';
  readonly persistent: boolean;

  // Comptes
  findUserByEmail(email: string): Promise<UserRecord | undefined>;
  getUser(id: string): Promise<UserRecord | undefined>;
  createUser(user: UserRecord): Promise<void>;
  updateUser(user: UserRecord): Promise<void>;

  // Profil et réglages
  getProfile(userId: string): Promise<ProfileRecord | undefined>;
  saveProfile(profile: ProfileRecord): Promise<void>;
  getSettings(userId: string): Promise<SettingsRecord | undefined>;
  saveSettings(settings: SettingsRecord): Promise<void>;

  // Progression
  listTrackProgress(userId: string): Promise<TrackProgressRecord[]>;
  saveTrackProgress(row: TrackProgressRecord): Promise<void>;
  listLessonProgress(userId: string): Promise<LessonProgressRecord[]>;
  saveLessonProgress(row: LessonProgressRecord): Promise<void>;

  // Activité
  appendAttempts(rows: AttemptRecord[]): Promise<void>;
  listAttempts(userId: string): Promise<AttemptRecord[]>;
  listMemories(userId: string): Promise<MemoryRecord[]>;
  saveMemories(rows: MemoryRecord[]): Promise<void>;

  // Gamification
  appendXp(rows: XpRecord[]): Promise<void>;
  listXp(userId: string): Promise<XpRecord[]>;
  getDaily(userId: string, day: string): Promise<DailyRecord | undefined>;
  saveDaily(row: DailyRecord): Promise<void>;
  listDaily(userId: string): Promise<DailyRecord[]>;
  getStreak(userId: string): Promise<StreakRecord | undefined>;
  saveStreak(row: StreakRecord): Promise<void>;
  listBadges(userId: string): Promise<UserBadgeRecord[]>;
  awardBadges(rows: UserBadgeRecord[]): Promise<void>;
  listCertificates(userId: string): Promise<CertificateRecord[]>;
  saveCertificate(row: CertificateRecord): Promise<void>;

  // Hors connexion
  listOffline(userId: string): Promise<OfflineContentRecord[]>;
  saveOffline(row: OfflineContentRecord): Promise<void>;
  removeOffline(id: string): Promise<void>;

  // Synchronisation
  enqueue(row: SyncQueueRecord): Promise<void>;
  pendingCount(userId: string): Promise<number>;
  drainQueue(userId: string): Promise<SyncQueueRecord[]>;

  // Compte
  exportAll(userId: string): Promise<Record<string, unknown>>;
  clearUserData(userId: string): Promise<void>;
}
