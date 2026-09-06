import { useMemo, useState } from 'react';
import { useT } from '@/i18n';
import { Button, Card, EmptyState } from '@/ds';
import { Fox } from '@/mascot';
import { useApp } from '@/state/store';
import { conceptToLessonMap, dueForReview } from '@/state/selectors';
import { buildReviewSession } from '@/engine/selection';
import { recognitionAvailable } from '@/lib/tts';
import { SessionPlayer } from '@/features/lesson/SessionPlayer';

export function ReviewPage() {
  const t = useT();
  const profile = useApp((s) => s.profile);
  const memories = useApp((s) => s.memories);
  const [started, setStarted] = useState(false);

  const due = useMemo(() => dueForReview(memories), [memories]);

  const exercises = useMemo(() => {
    if (!profile) return [];
    return buildReviewSession(
      Object.values(memories),
      conceptToLessonMap(memories),
      profile.level,
      recognitionAvailable(),
      8
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  if (!profile) return null;

  if (started && exercises.length > 0) {
    return (
      <SessionPlayer
        exercises={exercises}
        lessonId={`review-${Date.now()}`}
        title={t('learn.review')}
        isReview
        exitTo="/app/review"
        continueTo="/app"
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-4">
        <Fox size={72} expression={due.length > 0 ? 'motivated' : 'proud'} animate />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {t('dashboard.reviewTitle')}
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {due.length > 0 ? t('dashboard.reviewSub', { n: due.length }) : t('dashboard.noReview')}
          </p>
        </div>
      </header>

      {due.length === 0 ? (
        <EmptyState
          title={t('dashboard.noReview')}
          text="Le moteur de répétition espacée ramènera automatiquement les notions fragiles quand ce sera le bon moment."
        />
      ) : (
        <>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Notions programmées aujourd’hui
            </p>
            <ul className="mt-3 space-y-2">
              {due.slice(0, 8).map((m) => (
                <li key={m.conceptId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-soft">{m.conceptId}</span>
                  <span className="ml-3 shrink-0 tabular-nums text-ink-muted">
                    {m.correct}/{m.attempts} réussis
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Button block size="lg" onClick={() => setStarted(true)}>
            {t('dashboard.reviewCta')}
          </Button>
        </>
      )}
    </div>
  );
}
