import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import { Button, Card, Chip, ProgressBar, SkillBar } from '@/ds';
import { IconSpeaker } from '@/ds/icons';
import { Fox } from '@/mascot';
import { useApp } from '@/state/store';
import { trackForLevel } from '@/content';
import {
  PLACEMENT_MAX_QUESTIONS,
  computeResult,
  nextQuestion,
  startPlacement,
  submitAnswer,
  type PlacementResult,
  type PlacementState,
} from '@/engine/placement';
import { speak, speechAvailable } from '@/lib/tts';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';

type Phase = 'intro' | 'running' | 'result';

export function PlacementPage() {
  const t = useT();
  const { dict } = useI18n();
  const navigate = useNavigate();
  const updateProfile = useApp((s) => s.updateProfile);
  const profile = useApp((s) => s.profile);

  const [phase, setPhase] = useState<Phase>('intro');
  const [state, setState] = useState<PlacementState>(startPlacement);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PlacementResult | null>(null);

  const question = useMemo(() => (phase === 'running' ? nextQuestion(state) : null), [phase, state]);

  useEffect(() => {
    if (question?.audio && speechAvailable()) speak(question.audio);
  }, [question]);

  function begin() {
    track('placement_started');
    setPhase('running');
  }

  function validate() {
    if (!question || selected === null) return;
    const next = submitAnswer(state, question, selected);
    setSelected(null);
    setState(next);
    if (next.finished || nextQuestion(next) === null) {
      const r = computeResult(next);
      setResult(r);
      setPhase('result');
      feedback('levelUp');
      track('placement_completed', { level: r.level, score: r.scorePercent });
    }
  }

  async function accept(level: PlacementResult['level']) {
    const activeTrack = profile ? trackForLevel(profile.goal, level) : 'general';
    await updateProfile({ level, activeTrack, placementDone: true });
    navigate('/app', { replace: true });
  }

  async function skip() {
    track('placement_skipped');
    await updateProfile({ level: 'A1', activeTrack: 'general', placementDone: true });
    navigate('/app', { replace: true });
  }

  // ---- Introduction -------------------------------------------------------
  if (phase === 'intro') {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <Fox size={110} expression="motivated" animate />
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">
            {t('placement.title')}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{t('placement.intro')}</p>
          <Chip tone="neutral" className="mt-4">
            {PLACEMENT_MAX_QUESTIONS} questions · {t('common.optional')}
          </Chip>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={begin}>
              {t('placement.startTest')}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => void skip()}>
              {t('common.skip')}
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  // ---- Résultat -----------------------------------------------------------
  if (phase === 'result' && result) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <Fox size={104} expression="proud" stage={Math.max(1, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(result.level) + 1)} />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            {t('placement.resultTitle')}
          </p>
          <p className="font-display text-6xl font-extrabold tracking-tight text-blue-600">{result.level}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {dict.levels[result.level]} · {t('placement.score')} {result.scorePercent}%
          </p>
        </div>

        <Card className="mt-8">
          <h2 className="font-display font-bold text-ink">Détail par compétence</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(result.bySkill).map(([skill, data]) => (
              <SkillBar
                key={skill}
                label={`${dict.stats.skills[skill as keyof typeof dict.stats.skills]} (${data.level})`}
                value={data.percent}
              />
            ))}
          </div>
        </Card>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('placement.strengths')}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {result.strengths.length > 0
                ? result.strengths.map((s) => dict.stats.skills[s]).join(', ')
                : '—'}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('placement.weaknesses')}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {result.weaknesses.length > 0
                ? result.weaknesses.map((s) => dict.stats.skills[s]).join(', ')
                : '—'}
            </p>
          </Card>
        </div>

        <div className="mt-4 rounded-xl2 bg-blue-50 p-4 text-sm text-blue-900">
          <strong className="font-semibold">{t('placement.recommendation')} : </strong>
          {t('placement.recommendationText', { level: result.level })}
        </div>

        <Button block size="lg" className="mt-6" onClick={() => void accept(result.level)}>
          {t('placement.goToDashboard')}
        </Button>
      </Shell>
    );
  }

  // ---- Question -----------------------------------------------------------
  if (!question) {
    return (
      <Shell>
        <p className="text-center text-sm text-ink-muted">{t('common.loading')}</p>
      </Shell>
    );
  }

  const index = state.answers.length + 1;

  return (
    <Shell>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink-muted">
          <span>
            {t('placement.question')} {index} / {PLACEMENT_MAX_QUESTIONS}
          </span>
          <Chip tone="neutral">{question.level}</Chip>
        </div>
        <ProgressBar value={index - 1} max={PLACEMENT_MAX_QUESTIONS} size="sm" />
      </div>

      <Card>
        {question.support && (
          <p className="mb-4 rounded-xl bg-surface-alt p-4 text-sm leading-relaxed text-ink-soft">
            {question.support}
          </p>
        )}
        {question.audio && (
          <button
            type="button"
            onClick={() => {
              feedback('tap');
              speak(question.audio!);
            }}
            className="mb-4 inline-flex items-center gap-2 rounded-xl2 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <IconSpeaker /> {t('lesson.listenAgain')}
          </button>
        )}
        <p className="font-display text-lg font-bold text-ink">{question.prompt}</p>
        <ul className="mt-4 space-y-2">
          {question.options.map((opt, i) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  feedback('select');
                  setSelected(i);
                }}
                aria-pressed={selected === i}
                className={cn(
                  'w-full rounded-xl2 border-2 px-4 py-3 text-left text-[15px] transition-all',
                  selected === i
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900'
                    : 'border-surface-sunk text-ink-soft hover:border-blue-200'
                )}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-5 flex gap-3">
        <Button variant="ghost" onClick={() => void skip()}>
          {t('common.skip')}
        </Button>
        <Button block size="lg" disabled={selected === null} onClick={validate}>
          {t('common.check')}
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-alt pt-[var(--safe-top)]">
      <div className="mx-auto w-full max-w-lg px-5 py-8">{children}</div>
    </div>
  );
}
