import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import { Button, OptionCard, ProgressBar } from '@/ds';
import { Fox } from '@/mascot';
import { useApp } from '@/state/store';
import { TRACK_META, trackForLevel } from '@/content';
import type { LearningGoal } from '@/data/schema';
import type { DailyGoalId } from '@/engine/xp';
import { track } from '@/lib/analytics';

const GOALS: LearningGoal[] = ['general', 'business', 'academic', 'travel', 'interview'];
const PACES: DailyGoalId[] = ['light', 'regular', 'serious', 'intense'];

export function OnboardingPage() {
  const t = useT();
  const { dict } = useI18n();
  const navigate = useNavigate();
  const profile = useApp((s) => s.profile);
  const updateProfile = useApp((s) => s.updateProfile);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<LearningGoal>('general');
  const [pace, setPace] = useState<DailyGoalId>('regular');
  const [busy, setBusy] = useState(false);

  async function finish(mode: 'beginner' | 'test') {
    setBusy(true);
    await updateProfile({
      goal,
      // Le parcours visé n'est activé que si son contenu correspond au niveau.
      activeTrack: mode === 'beginner' ? trackForLevel(goal, 'A1') : goal,
      dailyGoal: pace,
      ...(mode === 'beginner' ? { level: 'A1' as const, placementDone: true } : {}),
    });
    track('onboarding_completed', { goal, pace, mode });
    setBusy(false);
    navigate(mode === 'beginner' ? '/app' : '/placement', { replace: true });
  }

  const expressions = ['happy', 'thinking', 'motivated'] as const;

  return (
    <div className="min-h-screen bg-surface-alt pt-[var(--safe-top)]">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 py-6">
        <ProgressBar value={step + 1} max={3} tone="blue" size="sm" className="mb-6" />

        <div className="mb-6 flex items-center gap-4">
          <Fox size={72} expression={expressions[step]} animate />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {t('onboarding.welcome')}
              {profile?.firstName ? `, ${profile.firstName}` : ''}
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
              {step === 0 && t('onboarding.goalTitle')}
              {step === 1 && t('onboarding.dailyTitle')}
              {step === 2 && t('onboarding.levelTitle')}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {step === 0 && t('onboarding.goalSub')}
              {step === 1 && t('onboarding.dailySub')}
              {step === 2 && t('onboarding.levelSub')}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {step === 0 &&
            GOALS.map((g) => (
              <OptionCard
                key={g}
                selected={goal === g}
                onSelect={() => setGoal(g)}
                title={dict.onboarding.goals[g]}
                description={TRACK_META[g].description}
                icon={<span className="text-lg">{TRACK_META[g].icon}</span>}
              />
            ))}

          {step === 1 &&
            PACES.map((p) => (
              <OptionCard
                key={p}
                selected={pace === p}
                onSelect={() => setPace(p)}
                title={dict.onboarding.paces[p].label}
                description={dict.onboarding.paces[p].detail}
              />
            ))}

          {step === 2 && (
            <>
              <OptionCard
                selected={false}
                onSelect={() => void finish('beginner')}
                title={t('onboarding.startBeginner')}
                description={t('onboarding.startBeginnerSub')}
                icon={<span className="text-lg">🌱</span>}
                disabled={busy}
              />
              <OptionCard
                selected={false}
                onSelect={() => void finish('test')}
                title={t('onboarding.takeTest')}
                description={t('onboarding.takeTestSub')}
                icon={<span className="text-lg">🎯</span>}
                disabled={busy}
              />
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={busy}>
              {t('common.back')}
            </Button>
          )}
          {step < 2 && (
            <Button block onClick={() => setStep(step + 1)}>
              {t('common.continue')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
