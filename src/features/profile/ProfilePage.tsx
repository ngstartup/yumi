import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import {
  Button,
  Card,
  Chip,
  Field,
  Modal,
  SectionTitle,
  SegmentedControl,
  Slider,
  Toggle,
  useToast,
} from '@/ds';
import { Fox } from '@/mascot';
import { LEVEL_TO_STAGE, STAGE_NAMES } from '@/mascot/expressions';
import { useApp } from '@/state/store';
import { AVAILABLE_LOCALES, type Locale } from '@/i18n/types';
import { DAILY_GOALS, type DailyGoalId } from '@/engine/xp';
import { localAuth } from '@/auth/localAuth';
import { AuthFailure } from '@/auth/types';
import { TRACK_META, TRACK_KEYS } from '@/content';
import { UpdateSection } from './UpdateSection';
import { VoiceSection } from './VoiceSection';
import {
  feedback,
  hapticsSupported,
  previewHaptic,
  previewSound,
  soundSupported,
  type HapticIntensity,
} from '@/lib/feedback';

export function ProfilePage() {
  const t = useT();
  const { dict, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const { push } = useToast();

  const user = useApp((s) => s.user);
  const profile = useApp((s) => s.profile);
  const settings = useApp((s) => s.settings);
  const totals = useApp((s) => s.totals);
  const badges = useApp((s) => s.badges);
  const persistent = useApp((s) => s.persistent);
  const pendingSync = useApp((s) => s.pendingSync);
  const updateProfile = useApp((s) => s.updateProfile);
  const updateSettings = useApp((s) => s.updateSettings);
  const signOut = useApp((s) => s.signOut);
  const exportData = useApp((s) => s.exportData);
  const resetProgress = useApp((s) => s.resetProgress);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: profile?.firstName ?? '', lastName: profile?.lastName ?? '' });
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!profile || !user) return null;
  const stage = LEVEL_TO_STAGE[profile.level] ?? 1;

  async function onExport() {
    const data = await exportData();
    const json = JSON.stringify(data, null, 2);

    // Téléchargement du fichier là où c'est permis…
    let downloaded = false;
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yumi-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      downloaded = true;
    } catch {
      downloaded = false;
    }

    // …et copie dans le presse-papiers, pour que l'export aboutisse toujours,
    // y compris dans un contexte où le téléchargement est bloqué.
    let copied = false;
    try {
      await navigator.clipboard.writeText(json);
      copied = true;
    } catch {
      copied = false;
    }

    if (downloaded && copied) push('Export généré et copié dans le presse-papiers', 'success', '📄');
    else if (copied) push('Export copié dans le presse-papiers', 'success', '📋');
    else if (downloaded) push('Export généré', 'success', '📄');
    else push('Export impossible dans ce contexte', 'warning', '⚠️');
  }

  async function onChangePassword() {
    setPwdError(null);
    try {
      await localAuth.changePassword({
        userId: user!.id,
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwd({ current: '', next: '' });
      push('Mot de passe mis à jour', 'success', '🔒');
    } catch (err) {
      setPwdError(
        err instanceof AuthFailure && err.code === 'password_short'
          ? t('auth.errors.passwordShort')
          : t('auth.errors.credentials')
      );
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Fox size={80} stage={stage} expression="happy" animate />
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight text-ink">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="truncate text-sm text-ink-muted">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Chip tone="blue">
              {profile.level} — {dict.levels[profile.level]}
            </Chip>
            <Chip tone="sun">⚡ {totals.xp} XP</Chip>
            <Chip tone="neutral">🏅 {badges.length}</Chip>
          </div>
        </div>
      </header>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-ink">{STAGE_NAMES[stage]}</p>
            <p className="text-xs text-ink-muted">
              {t('profile.memberSince', { date: new Date(profile.createdAt).toLocaleDateString('fr-FR') })}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            {t('profile.editProfile')}
          </Button>
        </div>
      </Card>

      {/* Apprentissage */}
      <section>
        <SectionTitle>{t('profile.settings')}</SectionTitle>
        <Card className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">{t('profile.learningGoal')}</p>
            <div className="flex flex-wrap gap-2">
              {TRACK_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    feedback('select');
                    void updateProfile({ goal: k, activeTrack: k });
                  }}
                  aria-pressed={profile.activeTrack === k}
                  className={
                    profile.activeTrack === k
                      ? 'rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800'
                      : 'rounded-xl border-2 border-surface-sunk px-3 py-2 text-sm font-medium text-ink-muted hover:border-blue-200'
                  }
                >
                  {TRACK_META[k].icon} {TRACK_META[k].name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">{t('profile.dailyGoal')}</p>
            <SegmentedControl<DailyGoalId>
              label={t('profile.dailyGoal')}
              value={profile.dailyGoal}
              onChange={(v) => void updateProfile({ dailyGoal: v })}
              options={DAILY_GOALS.map((g) => ({ value: g.id, label: `${g.xp} XP` }))}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">{t('profile.interfaceLanguage')}</p>
            <SegmentedControl<Locale>
              label={t('profile.interfaceLanguage')}
              value={locale}
              onChange={(v) => {
                setLocale(v);
                void updateProfile({ locale: v });
              }}
              options={AVAILABLE_LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))}
            />
          </div>
        </Card>
      </section>

      {/* Notifications */}
      {settings && (
        <section>
          <SectionTitle>{t('profile.notifications')}</SectionTitle>
          <Card>
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => void updateSettings({ notificationsEnabled: v })}
              label={t('profile.notifications')}
              description={t('profile.notificationsHint')}
            />
            {settings.notificationsEnabled && (
              <div className="mt-3 max-w-[10rem]">
                <Field
                  label={t('profile.reminderTime')}
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => void updateSettings({ reminderTime: e.target.value })}
                />
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Son et vibrations */}
      {settings && (
        <section>
          <SectionTitle>{t('profile.feedback.title')}</SectionTitle>
          <Card className="space-y-4">
            <p className="text-sm leading-relaxed text-ink-muted">{t('profile.feedback.intro')}</p>

            {/* — Son — */}
            <div className="border-t border-surface-sunk pt-3">
              <Toggle
                checked={settings.soundEnabled && soundSupported()}
                onChange={(v) => void updateSettings({ soundEnabled: v })}
                label={t('profile.feedback.sound')}
                description={
                  soundSupported()
                    ? t('profile.feedback.soundHint')
                    : t('profile.feedback.soundUnsupported')
                }
              />
              <div className="mt-3">
                <Slider
                  label={t('profile.feedback.volume')}
                  value={Math.round(settings.soundVolume * 100)}
                  disabled={!settings.soundEnabled || !soundSupported()}
                  onChange={(v) => void updateSettings({ soundVolume: v / 100 })}
                  onCommit={(v) => previewSound(v / 100)}
                  format={(v) => `${v} %`}
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                disabled={!settings.soundEnabled || !soundSupported()}
                feedbackEvent={null}
                onClick={() => previewSound(settings.soundVolume)}
              >
                {t('profile.feedback.testSound')}
              </Button>
            </div>

            {/* — Vibrations — */}
            <div className="border-t border-surface-sunk pt-3">
              <Toggle
                checked={settings.hapticsEnabled && hapticsSupported()}
                onChange={(v) => {
                  void updateSettings({ hapticsEnabled: v });
                  if (v) previewHaptic(settings.hapticsIntensity);
                }}
                label={t('profile.feedback.haptics')}
                description={
                  hapticsSupported()
                    ? t('profile.feedback.hapticsHint')
                    : t('profile.feedback.hapticsUnsupported')
                }
              />
              <div className="mt-3">
                <p className="mb-2 text-sm font-semibold text-ink-soft">
                  {t('profile.feedback.intensity')}
                </p>
                <div className={!settings.hapticsEnabled || !hapticsSupported() ? 'opacity-50' : undefined}>
                  <SegmentedControl<HapticIntensity>
                    label={t('profile.feedback.intensity')}
                    value={settings.hapticsIntensity}
                    onChange={(v) => {
                      void updateSettings({ hapticsIntensity: v });
                      previewHaptic(v);
                    }}
                    options={[
                      { value: 'light', label: t('profile.feedback.light') },
                      { value: 'medium', label: t('profile.feedback.medium') },
                      { value: 'strong', label: t('profile.feedback.strong') },
                    ]}
                  />
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                disabled={!settings.hapticsEnabled || !hapticsSupported()}
                feedbackEvent={null}
                onClick={() => previewHaptic(settings.hapticsIntensity)}
              >
                {t('profile.feedback.testHaptics')}
              </Button>
            </div>

            {/* — Voix des exercices d'écoute — */}
            <VoiceSection />
          </Card>
        </section>
      )}

      {/* Version installée et mises à jour */}
      <UpdateSection />

      {/* Confidentialité */}
      <section>
        <SectionTitle>{t('profile.privacy')}</SectionTitle>
        <Card>
          <p className="text-sm leading-relaxed text-ink-muted">{t('profile.privacyText')}</p>
          {!persistent && (
            <p className="mt-3 rounded-xl bg-sun-50 p-3 text-xs text-sun-900">
              Le stockage persistant n’est pas disponible dans ce navigateur : votre progression sera perdue à la
              fermeture de l’onglet.
            </p>
          )}
          {pendingSync > 0 && (
            <p className="mt-3 text-xs text-ink-muted">{t('offline.queued', { n: pendingSync })}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void onExport()}>
              {t('profile.exportData')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
              {t('profile.deleteData')}
            </Button>
          </div>
        </Card>
      </section>

      {/* Sécurité */}
      <section>
        <SectionTitle>{t('profile.security')}</SectionTitle>
        <Card className="space-y-3">
          <Field
            label={t('profile.currentPassword')}
            type="password"
            autoComplete="current-password"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
          />
          <Field
            label={t('auth.newPassword')}
            type="password"
            autoComplete="new-password"
            hint={t('auth.passwordHint')}
            error={pwdError ?? undefined}
            value={pwd.next}
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
          />
          <Button size="sm" disabled={!pwd.current || !pwd.next} onClick={() => void onChangePassword()}>
            {t('profile.changePassword')}
          </Button>
        </Card>
      </section>

      <Button
        variant="secondary"
        block
        onClick={async () => {
          await signOut();
          navigate('/', { replace: true });
        }}
      >
        {t('auth.signOut')}
      </Button>

      {/* Modales */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={t('profile.editProfile')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={async () => {
                await updateProfile({ firstName: form.firstName, lastName: form.lastName });
                setEditing(false);
                push(t('common.save'), 'success', '✅');
              }}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field
            label={t('auth.firstName')}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Field
            label={t('auth.lastName')}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('profile.deleteData')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await resetProgress();
                setConfirmReset(false);
                push('Progression effacée', 'info', '🗑️');
              }}
            >
              {t('profile.deleteData')}
            </Button>
          </>
        }
      >
        {t('profile.deleteConfirm')}
      </Modal>
    </div>
  );
}
