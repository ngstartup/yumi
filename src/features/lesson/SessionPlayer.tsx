import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { Button, IconButton, Modal, ProgressBar, useToast } from '@/ds';
import { IconX } from '@/ds/icons';
import { Fox, type Expression } from '@/mascot';
import { cn } from '@/lib/cn';
import { stopSpeaking } from '@/lib/tts';
import { feedback } from '@/lib/feedback';
import { grade, type Answer } from '@/engine/grading';
import type { Exercise, GradeResult } from '@/engine/types';
import { useApp, type SessionOutcome, type SessionSummary } from '@/state/store';
import { ExerciseView, hasAnswer } from './exercises';
import { LessonComplete } from './LessonComplete';

interface Props {
  exercises: Exercise[];
  lessonId: string;
  title: string;
  subtitle?: string;
  intro?: ReactNode;
  isReview?: boolean;
  isAssessment?: boolean;
  exitTo?: string;
  continueTo?: string;
  continueLabel?: string;
  onFinished?: (summary: SessionSummary, outcomes: SessionOutcome[]) => void;
}

type Phase = 'intro' | 'playing' | 'complete';

export function SessionPlayer({
  exercises,
  lessonId,
  title,
  subtitle,
  intro,
  isReview = false,
  isAssessment = false,
  exitTo = '/app/learn',
  continueTo = '/app/learn',
  continueLabel,
  onFinished,
}: Props) {
  const t = useT();
  const navigate = useNavigate();
  const { push } = useToast();
  const completeSession = useApp((s) => s.completeSession);

  const [phase, setPhase] = useState<Phase>(intro ? 'intro' : 'playing');
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [outcomes, setOutcomes] = useState<SessionOutcome[]>([]);
  const [combo, setCombo] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [saving, setSaving] = useState(false);

  const startedAt = useRef(Date.now());
  const questionStart = useRef(Date.now());
  const feedbackRef = useRef<HTMLDivElement>(null);

  const exercise = exercises[index];
  const total = exercises.length;

  useEffect(() => {
    questionStart.current = Date.now();
  }, [index]);

  useEffect(() => () => stopSpeaking(), []);

  const finish = useCallback(
    async (all: SessionOutcome[]) => {
      setSaving(true);
      try {
        const s = await completeSession({
          lessonId,
          outcomes: all,
          durationMs: Date.now() - startedAt.current,
          isReview,
          isAssessment,
        });
        setSummary(s);
        setPhase('complete');
        onFinished?.(s, all);
      } catch (err) {
        console.error('[yumi] enregistrement de la session impossible', err);
        push(t('common.error'), 'error');
        navigate(exitTo);
      } finally {
        setSaving(false);
      }
    },
    [completeSession, lessonId, isReview, isAssessment, onFinished, push, t, navigate, exitTo]
  );

  function check() {
    if (!exercise || !answer || result) return;
    const r = grade(exercise, answer);
    const nextCombo = r.correct ? combo + 1 : 0;
    setResult(r);
    setCombo(nextCombo);

    // Le retour sensoriel dit immédiatement ce que l'œil va lire ensuite.
    if (!r.correct) feedback('incorrect');
    else if (r.nearMiss) feedback('nearMiss');
    else if (nextCombo >= 3) feedback('combo');
    else feedback('correct');

    window.setTimeout(() => feedbackRef.current?.focus(), 40);
  }

  function next() {
    if (!exercise || !result) return;
    const outcome: SessionOutcome = {
      exercise,
      correct: result.correct,
      nearMiss: Boolean(result.nearMiss),
      answer: describeAnswer(answer),
      durationMs: Date.now() - questionStart.current,
    };
    const all = [...outcomes, outcome];
    setOutcomes(all);
    setResult(null);
    setAnswer(null);
    if (index + 1 >= total) void finish(all);
    else setIndex(index + 1);
  }

  function skip() {
    if (!exercise) return;
    const all = [
      ...outcomes,
      {
        exercise,
        correct: false,
        nearMiss: false,
        answer: '',
        durationMs: Date.now() - questionStart.current,
      },
    ];
    setOutcomes(all);
    setResult(null);
    setAnswer(null);
    setCombo(0);
    if (index + 1 >= total) void finish(all);
    else setIndex(index + 1);
  }

  const mascotExpression: Expression = result
    ? result.correct
      ? combo >= 3
        ? 'victory'
        : 'proud'
      : 'mistake'
    : 'focused';

  const canCheck = useMemo(
    () => (exercise && answer ? hasAnswer({ exercise, answer }) : false),
    [exercise, answer]
  );

  // ---- Écran d'introduction ----------------------------------------------
  if (phase === 'intro' && intro) {
    return (
      <SessionShell title={title} subtitle={subtitle} onQuit={() => navigate(exitTo)} progress={0} total={total}>
        <div className="pb-28">{intro}</div>
        <FooterBar>
          <Button block size="lg" onClick={() => setPhase('playing')}>
            {t('common.start')}
          </Button>
        </FooterBar>
      </SessionShell>
    );
  }

  // ---- Fin de session -----------------------------------------------------
  if (phase === 'complete' && summary) {
    return (
      <LessonComplete
        summary={summary}
        continueLabel={continueLabel}
        onContinue={() => navigate(continueTo)}
      />
    );
  }

  if (!exercise) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-ink-muted">
        {t('common.loading')}
      </div>
    );
  }

  // ---- Exercice -----------------------------------------------------------
  return (
    <SessionShell
      title={title}
      subtitle={subtitle}
      onQuit={() => setConfirmQuit(true)}
      progress={index}
      total={total}
      combo={combo}
    >
      <div className="pb-56 sm:pb-48">
        <ExerciseView
          exercise={exercise}
          answer={answer}
          onAnswer={setAnswer}
          locked={result !== null}
          result={result}
        />
      </div>

      {result ? (
        <FeedbackBar result={result} expression={mascotExpression} onNext={next} busy={saving} innerRef={feedbackRef} />
      ) : (
        <FooterBar>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={skip}>
              {t('lesson.skipExercise')}
            </Button>
            {/* Pas de son d'appui ici : la correction joue aussitôt son propre
                retour, plus expressif. */}
            <Button block size="lg" disabled={!canCheck} onClick={check} feedbackEvent={null}>
              {t('common.check')}
            </Button>
          </div>
        </FooterBar>
      )}

      <Modal
        open={confirmQuit}
        onClose={() => setConfirmQuit(false)}
        title={t('lesson.quit')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmQuit(false)}>
              {t('lesson.quitStay')}
            </Button>
            <Button variant="danger" onClick={() => navigate(exitTo)}>
              {t('lesson.quitLeave')}
            </Button>
          </>
        }
      >
        {t('lesson.quitConfirm')}
      </Modal>
    </SessionShell>
  );
}

// ---------------------------------------------------------------------------

function SessionShell({
  title,
  subtitle,
  onQuit,
  progress,
  total,
  combo = 0,
  children,
}: {
  title: string;
  subtitle?: string;
  onQuit: () => void;
  progress: number;
  total: number;
  combo?: number;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div className="min-h-screen bg-surface">
      {/* Le fond de la barre couvre l'encoche ; son contenu commence dessous. */}
      <header className="sticky top-0 z-30 border-b border-surface-sunk bg-white/95 pt-[var(--safe-top)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <IconButton label={t('lesson.quit')} onClick={onQuit}>
            <IconX />
          </IconButton>
          <div className="min-w-0 flex-1">
            <ProgressBar value={progress} max={total} tone={combo >= 3 ? 'sun' : 'blue'} />
            <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {title}
              {subtitle ? ` · ${subtitle}` : ''}
            </p>
          </div>
          {combo >= 3 && (
            <span className="animate-pop rounded-full bg-sun-100 px-2.5 py-1 text-xs font-extrabold text-sun-800">
              ×{combo}
            </span>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}

function FooterBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-sunk bg-white/95 pb-[var(--safe-bottom)] backdrop-blur">
      <div className="mx-auto max-w-2xl px-4 py-3">{children}</div>
    </div>
  );
}

function FeedbackBar({
  result,
  expression,
  onNext,
  busy,
  innerRef,
}: {
  result: GradeResult;
  expression: Expression;
  onNext: () => void;
  busy: boolean;
  innerRef: React.RefObject<HTMLDivElement>;
}) {
  const t = useT();
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 animate-riseIn border-t-2 pb-[var(--safe-bottom)]',
        result.correct ? 'border-mint-500 bg-emerald-50' : 'border-coral-400 bg-rose-50'
      )}
    >
      <div
        ref={innerRef}
        tabIndex={-1}
        role="status"
        aria-live="assertive"
        className="mx-auto max-w-2xl px-4 py-4 outline-none"
      >
        <div className="flex items-start gap-3">
          <Fox size={54} expression={expression} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'font-display text-lg font-extrabold',
                result.correct ? 'text-emerald-800' : 'text-rose-800'
              )}
            >
              {result.correct ? `✅ ${t('lesson.correct')}` : `❌ ${t('lesson.incorrect')}`}
            </p>
            {!result.correct && (
              <p className="mt-1 text-sm text-rose-900">
                <span className="font-semibold">{t('lesson.goodAnswer')} : </span>
                {result.expected}
              </p>
            )}
            <p
              className={cn(
                'mt-1 text-sm leading-relaxed',
                result.correct ? 'text-emerald-900/85' : 'text-rose-900/85'
              )}
            >
              {result.explanation}
            </p>
            {result.hint && <p className="mt-1 text-xs italic text-ink-muted">{result.hint}</p>}
          </div>
        </div>
        <Button
          block
          size="lg"
          className="mt-3"
          variant={result.correct ? 'success' : 'danger'}
          onClick={onNext}
          loading={busy}
          feedbackEvent="tap"
        >
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

function describeAnswer(answer: Answer | null): string {
  if (!answer) return '';
  switch (answer.kind) {
    case 'choice':
      return `#${answer.index}`;
    case 'text':
      return answer.value;
    case 'tokens':
      return answer.value.join(' ');
    case 'boolean':
      return String(answer.value);
    case 'pairs':
      return Object.entries(answer.value)
        .map(([k, v]) => `${k}→${v}`)
        .join(', ');
    default:
      return '';
  }
}
