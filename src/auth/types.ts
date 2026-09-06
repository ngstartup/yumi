import type { ProfileRecord, UserRecord } from '@/data/schema';

export interface Session {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthUser {
  user: UserRecord;
  profile: ProfileRecord;
}

export type AuthError =
  | 'email_invalid'
  | 'email_taken'
  | 'password_short'
  | 'name_required'
  | 'credentials'
  | 'unknown_email';

export class AuthFailure extends Error {
  constructor(public code: AuthError) {
    super(code);
    this.name = 'AuthFailure';
  }
}

/** Contrat d'authentification — une implémentation locale aujourd'hui,
 *  Supabase / Google / Apple demain, sans changer les écrans. */
export interface AuthProvider {
  readonly id: string;
  signUp(input: { email: string; password: string; firstName: string; lastName?: string }): Promise<AuthUser>;
  signIn(input: { email: string; password: string }): Promise<AuthUser>;
  signOut(): Promise<void>;
  restore(): Promise<AuthUser | null>;
  resetPassword(input: { email: string; newPassword: string }): Promise<void>;
  changePassword(input: { userId: string; currentPassword: string; newPassword: string }): Promise<void>;
}
