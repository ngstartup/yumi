import { getDb, type KeyValueStore } from './db';
import type { Repository } from './repository';
import { STORES } from './schema';
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

/** Implémentation locale, hors connexion par nature (IndexedDB). */
export class LocalRepository implements Repository {
  readonly kind = 'local' as const;

  private constructor(private db: KeyValueStore) {}

  static async create(): Promise<LocalRepository> {
    return new LocalRepository(await getDb());
  }

  get persistent() {
    return this.db.persistent;
  }

  // -- Comptes --------------------------------------------------------------

  async findUserByEmail(email: string) {
    const rows = await this.db.getAllByIndex<UserRecord>(STORES.users, 'email', email.toLowerCase());
    return rows[0];
  }
  getUser(id: string) {
    return this.db.get<UserRecord>(STORES.users, id);
  }
  createUser(user: UserRecord) {
    return this.db.put(STORES.users, { ...user, email: user.email.toLowerCase() });
  }
  updateUser(user: UserRecord) {
    return this.db.put(STORES.users, { ...user, email: user.email.toLowerCase() });
  }

  // -- Profil ---------------------------------------------------------------

  getProfile(userId: string) {
    return this.db.get<ProfileRecord>(STORES.profiles, userId);
  }
  saveProfile(profile: ProfileRecord) {
    return this.db.put(STORES.profiles, profile);
  }
  getSettings(userId: string) {
    return this.db.get<SettingsRecord>(STORES.settings, userId);
  }
  saveSettings(settings: SettingsRecord) {
    return this.db.put(STORES.settings, settings);
  }

  // -- Progression ----------------------------------------------------------

  listTrackProgress(userId: string) {
    return this.db.getAllByIndex<TrackProgressRecord>(STORES.trackProgress, 'userId', userId);
  }
  saveTrackProgress(row: TrackProgressRecord) {
    return this.db.put(STORES.trackProgress, row);
  }
  listLessonProgress(userId: string) {
    return this.db.getAllByIndex<LessonProgressRecord>(STORES.lessonProgress, 'userId', userId);
  }
  saveLessonProgress(row: LessonProgressRecord) {
    return this.db.put(STORES.lessonProgress, row);
  }

  // -- Activité -------------------------------------------------------------

  appendAttempts(rows: AttemptRecord[]) {
    return this.db.putMany(STORES.attempts, rows);
  }
  listAttempts(userId: string) {
    return this.db.getAllByIndex<AttemptRecord>(STORES.attempts, 'userId', userId);
  }
  listMemories(userId: string) {
    return this.db.getAllByIndex<MemoryRecord>(STORES.memories, 'userId', userId);
  }
  saveMemories(rows: MemoryRecord[]) {
    return this.db.putMany(STORES.memories, rows);
  }

  // -- Gamification ---------------------------------------------------------

  appendXp(rows: XpRecord[]) {
    return this.db.putMany(STORES.xp, rows);
  }
  listXp(userId: string) {
    return this.db.getAllByIndex<XpRecord>(STORES.xp, 'userId', userId);
  }
  getDaily(userId: string, day: string) {
    return this.db.get<DailyRecord>(STORES.daily, `${userId}:${day}`);
  }
  saveDaily(row: DailyRecord) {
    return this.db.put(STORES.daily, row);
  }
  listDaily(userId: string) {
    return this.db.getAllByIndex<DailyRecord>(STORES.daily, 'userId', userId);
  }
  getStreak(userId: string) {
    return this.db.get<StreakRecord>(STORES.streaks, userId);
  }
  saveStreak(row: StreakRecord) {
    return this.db.put(STORES.streaks, row);
  }
  listBadges(userId: string) {
    return this.db.getAllByIndex<UserBadgeRecord>(STORES.badges, 'userId', userId);
  }
  awardBadges(rows: UserBadgeRecord[]) {
    return this.db.putMany(STORES.badges, rows);
  }
  listCertificates(userId: string) {
    return this.db.getAllByIndex<CertificateRecord>(STORES.certificates, 'userId', userId);
  }
  saveCertificate(row: CertificateRecord) {
    return this.db.put(STORES.certificates, row);
  }

  // -- Hors connexion -------------------------------------------------------

  listOffline(userId: string) {
    return this.db.getAllByIndex<OfflineContentRecord>(STORES.offline, 'userId', userId);
  }
  saveOffline(row: OfflineContentRecord) {
    return this.db.put(STORES.offline, row);
  }
  removeOffline(id: string) {
    return this.db.delete(STORES.offline, id);
  }

  // -- Synchronisation ------------------------------------------------------

  enqueue(row: SyncQueueRecord) {
    return this.db.put(STORES.syncQueue, row);
  }
  async pendingCount(userId: string) {
    const rows = await this.db.getAll<SyncQueueRecord>(STORES.syncQueue);
    return rows.filter((r) => r.userId === userId).length;
  }
  async drainQueue(userId: string) {
    const rows = (await this.db.getAll<SyncQueueRecord>(STORES.syncQueue)).filter(
      (r) => r.userId === userId
    );
    for (const r of rows) {
      if (r.seq !== undefined) await this.db.delete(STORES.syncQueue, r.seq);
    }
    return rows;
  }

  // -- Compte ---------------------------------------------------------------

  async exportAll(userId: string) {
    const [profile, settings, lessons, attempts, memories, xp, daily, streak, badges, certificates] =
      await Promise.all([
        this.getProfile(userId),
        this.getSettings(userId),
        this.listLessonProgress(userId),
        this.listAttempts(userId),
        this.listMemories(userId),
        this.listXp(userId),
        this.listDaily(userId),
        this.getStreak(userId),
        this.listBadges(userId),
        this.listCertificates(userId),
      ]);
    return {
      exportedAt: new Date().toISOString(),
      app: 'Yumi',
      profile,
      settings,
      lessonProgress: lessons,
      attempts,
      memories,
      xp,
      daily,
      streak,
      badges,
      certificates,
    };
  }

  clearUserData(userId: string) {
    return this.db.clearUser(userId);
  }
}
