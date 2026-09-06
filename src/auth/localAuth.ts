import { getRepository } from '@/data';
import { defaultSettings, type ProfileRecord, type UserRecord } from '@/data/schema';
import { hashPassword, randomId, randomSalt, verifyPassword } from '@/lib/crypto';
import { AuthFailure, type AuthProvider, type AuthUser, type Session } from './types';

const SESSION_KEY = 'yumi.session';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 90; // 90 jours

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.userId || s.expiresAt < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* stockage indisponible — la session ne survivra pas au rechargement */
  }
}

function defaultProfile(userId: string, firstName: string, lastName: string): ProfileRecord {
  const now = Date.now();
  return {
    userId,
    firstName,
    lastName,
    avatarSeed: randomId().slice(0, 8),
    locale: 'fr',
    goal: 'general',
    level: 'A1',
    activeTrack: 'general',
    dailyGoal: 'regular',
    placementDone: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const localAuth: AuthProvider = {
  id: 'local',

  async signUp({ email, password, firstName, lastName = '' }) {
    const repo = await getRepository();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) throw new AuthFailure('email_invalid');
    if (password.length < 8) throw new AuthFailure('password_short');
    if (!firstName.trim()) throw new AuthFailure('name_required');
    if (await repo.findUserByEmail(clean)) throw new AuthFailure('email_taken');

    const salt = randomSalt();
    const user: UserRecord = {
      id: randomId(),
      email: clean,
      passwordSalt: salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: Date.now(),
    };
    await repo.createUser(user);

    const profile = defaultProfile(user.id, firstName.trim(), lastName.trim());
    await repo.saveProfile(profile);
    await repo.saveSettings(defaultSettings(user.id));

    writeSession({ userId: user.id, email: clean, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL });
    return { user, profile };
  },

  async signIn({ email, password }) {
    const repo = await getRepository();
    const clean = email.trim().toLowerCase();
    const user = await repo.findUserByEmail(clean);
    if (!user) throw new AuthFailure('credentials');
    const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!ok) throw new AuthFailure('credentials');

    const profile = (await repo.getProfile(user.id)) ?? defaultProfile(user.id, 'Apprenant', '');
    await repo.saveProfile(profile);
    writeSession({ userId: user.id, email: clean, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL });
    return { user, profile };
  },

  async signOut() {
    writeSession(null);
  },

  async restore() {
    const session = readSession();
    if (!session) return null;
    const repo = await getRepository();
    const user = await repo.getUser(session.userId);
    if (!user) {
      writeSession(null);
      return null;
    }
    const profile = (await repo.getProfile(user.id)) ?? defaultProfile(user.id, 'Apprenant', '');
    return { user, profile };
  },

  async resetPassword({ email, newPassword }) {
    const repo = await getRepository();
    const user = await repo.findUserByEmail(email.trim().toLowerCase());
    if (!user) throw new AuthFailure('unknown_email');
    if (newPassword.length < 8) throw new AuthFailure('password_short');
    const salt = randomSalt();
    await repo.updateUser({
      ...user,
      passwordSalt: salt,
      passwordHash: await hashPassword(newPassword, salt),
    });
  },

  async changePassword({ userId, currentPassword, newPassword }) {
    const repo = await getRepository();
    const user = await repo.getUser(userId);
    if (!user) throw new AuthFailure('credentials');
    if (!(await verifyPassword(currentPassword, user.passwordSalt, user.passwordHash))) {
      throw new AuthFailure('credentials');
    }
    if (newPassword.length < 8) throw new AuthFailure('password_short');
    const salt = randomSalt();
    await repo.updateUser({
      ...user,
      passwordSalt: salt,
      passwordHash: await hashPassword(newPassword, salt),
    });
  },
};

export type { AuthUser };
