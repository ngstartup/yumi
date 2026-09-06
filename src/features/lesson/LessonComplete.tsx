import { useEffect } from 'react';
import { useI18n, useT } from '@/i18n';
import { Button, ButtonLink, Card, Chip } from '@/ds';
import { Fox } from '@/mascot';
import { badgeById } from '@/engine/badges';
import type { SessionSummary } from '@/state/store';
import { formatDuration } from '@/state/selectors';
import { feedback } from '@/lib/feedback';

export function LessonComplete({
  summary,
  onContinue,
  continueLabel,
}: {
  summary: SessionSummary;
  onContinue: () => void;
  continueLabel?: string;
}) {
  const t = useT();
  const { dict } = useI18n();

  // Célébration sonore et haptique, échelonnée pour que chaque récompense
  // s'entende distinctement plutôt que de se superposer.
  useEffect(() => {
    const timers: number[] = [];
    feedback('lessonComplete');
    if (summary.newBadges.length > 0) timers.push(window.setTimeout(() => feedback('badge'), 900));
    if (summary.goalJustReached) {
      timers.push(window.setTimeout(() => feedback('goalReached'), summary.newBadges.length > 0 ? 1700 : 900));
    }
    return () => timers.forEach(window.clearTimeout);
  }, [summary]);

  const reasonLabel: Record<string, string> = {
    correct_answer: 'Bonnes réponses',
    near_miss: 'Réponses presque justes',
    lesson_complete: 'Leçon terminée',
    perfect_lesson: t('lesson.perfectRun'),
    combo: t('lesson.comboBonus', { n: 5 }),
    assessment: 'Évaluation réussie',
    daily_goal: t('dashboard.dailyGoal'),
    review_session: 'Session de révision',
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <Fox size={128} expression={summary.perfect ? 'victory' : 'celebrating'} animate />
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
          🎉 {t('lesson.completeTitle')}
        </h1>
        <p className="mt-2 font-display text-4xl font-extrabold tabular-nums text-sun-600 animate-pop">
          +{summary.xpTotal} XP
        </p>
        {summary.perfect && (
          <Chip tone="mint" className="mt-3">
            {t('lesson.perfectRun')}
          </Chip>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Metric label={t('lesson.accuracy')} value={`${summary.accuracy} %`} />
        <Metric label={t('lesson.newWords')} value={String(summary.newWords)} />
        <Metric label={t('lesson.timeSpent')} value={formatDuration(summary.durationMs)} />
        <Metric label="🔥 Série" value={`${summary.streak} j`} />
      </div>

      {summary.grammarTopics.length > 0 && (
        <Card className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('lesson.grammarSeen')}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{summary.grammarTopics.join(' · ')}</p>
        </Card>
      )}

      <Card className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Détail de l’XP</p>
        <ul className="mt-2 space-y-1.5">
          {summary.xpEvents.map((e, i) => (
            <li key={`${e.reason}-${i}`} className="flex justify-between text-sm">
              <span className="text-ink-soft">{reasonLabel[e.reason] ?? e.reason}</span>
              <span className="font-semibold tabular-nums text-ink">+{e.amount}</span>
            </li>
          ))}
        </ul>
      </Card>

      {summary.newBadges.length > 0 && (
        <Card className="mt-3 border-2 border-sun-200 bg-sun-50 ring-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-sun-800">
            Nouveau{summary.newBadges.length > 1 ? 'x' : ''} badge
            {summary.newBadges.length > 1 ? 's' : ''}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {summary.newBadges.map((id) => {
              const def = badgeById(id);
              if (!def) return null;
              const label = dict.badges[def.i18nKey as keyof typeof dict.badges];
              return (
                <li
                  key={id}
                  className="flex animate-pop items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink shadow-card"
                >
                  <span aria-hidden>{def.emoji}</span>
                  {label?.name ?? id}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {summary.goalJustReached && (
        <div className="mt-3 rounded-xl2 bg-mint-500 p-4 text-center text-sm font-semibold text-white">
          {t('dashboard.goalReached')}
        </div>
      )}

      <div className="mt-7 space-y-2.5">
        <Button block size="lg" onClick={onContinue}>
          {continueLabel ?? t('lesson.continueLearning')}
        </Button>
        <ButtonLink to="/app" variant="ghost" block>
          {t('nav.home')}
        </ButtonLink>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 bg-white p-4 text-center shadow-card ring-1 ring-surface-sunk">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}
