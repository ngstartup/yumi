import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { speak, speechAvailable, listenOnce, recognitionAvailable } from '@/lib/tts';
import { feedback } from '@/lib/feedback';
import { IconMic, IconSpeaker } from '@/ds/icons';
import { Button } from '@/ds';
import type {
  DictationExercise,
  FillBlankExercise,
  MatchExercise,
  SpeakExercise,
  TranslateExercise,
  WordOrderExercise,
} from '@/engine/types';
import { OPTION_BASE, optionTone, type ExerciseProps } from './shared';

export function TranslateExerciseView({ exercise, answer, onAnswer, locked, result }: ExerciseProps<TranslateExercise>) {
  const t = useT();
  const value = answer?.kind === 'text' ? answer.value : '';
  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <p className="mt-3 font-display text-2xl font-extrabold leading-snug tracking-tight text-ink">
        {exercise.source}
      </p>
      <textarea
        value={value}
        disabled={locked}
        onChange={(e) => onAnswer({ kind: 'text', value: e.target.value })}
        rows={3}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label={t('lesson.typeAnswer')}
        placeholder={t('lesson.typeAnswer')}
        className={cn(
          'mt-5 w-full resize-none rounded-xl2 border-2 bg-white p-4 text-[17px] leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-muted/70',
          locked
            ? result?.correct
              ? 'border-mint-500 bg-emerald-50'
              : 'border-coral-400 bg-rose-50'
            : 'border-surface-sunk focus:border-blue-400'
        )}
      />
    </div>
  );
}

export function DictationExerciseView({ exercise, answer, onAnswer, locked, result }: ExerciseProps<DictationExercise>) {
  const t = useT();
  const value = answer?.kind === 'text' ? answer.value : '';

  useEffect(() => {
    if (exercise.audio && speechAvailable()) speak(exercise.audio);
  }, [exercise.id, exercise.audio]);

  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            feedback('tap');
            if (exercise.audio) speak(exercise.audio);
          }}
          className="flex flex-1 items-center justify-center gap-3 rounded-xl2 bg-blue-500 px-5 py-6 font-display text-lg font-bold text-white shadow-press transition hover:bg-blue-600"
        >
          <IconSpeaker width={26} height={26} /> {t('lesson.listenAgain')}
        </button>
        <button
          type="button"
          onClick={() => {
            feedback('tap');
            if (exercise.audio) speak(exercise.audio, { rate: 0.6 });
          }}
          aria-label={t('lesson.slower')}
          title={t('lesson.slower')}
          className="rounded-xl2 border-2 border-surface-sunk px-4 font-semibold text-ink-soft hover:border-blue-200"
        >
          0.5×
        </button>
      </div>
      <input
        value={value}
        disabled={locked}
        onChange={(e) => onAnswer({ kind: 'text', value: e.target.value })}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label={t('lesson.typeWhatYouHear')}
        placeholder={t('lesson.typeWhatYouHear')}
        className={cn(
          'mt-4 h-14 w-full rounded-xl2 border-2 bg-white px-4 text-[17px] text-ink outline-none transition-colors',
          locked
            ? result?.correct
              ? 'border-mint-500 bg-emerald-50'
              : 'border-coral-400 bg-rose-50'
            : 'border-surface-sunk focus:border-blue-400'
        )}
      />
    </div>
  );
}

export function FillBlankExerciseView({ exercise, answer, onAnswer, locked, result }: ExerciseProps<FillBlankExercise>) {
  const t = useT();
  const value = answer?.kind === 'text' ? answer.value : '';
  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <p className="mt-4 font-display text-xl font-bold leading-relaxed text-ink">
        {exercise.before}
        <span
          className={cn(
            'mx-1 inline-flex min-w-[6rem] justify-center rounded-lg border-b-4 px-2 py-0.5 align-middle',
            locked
              ? result?.correct
                ? 'border-mint-500 bg-emerald-50 text-emerald-800'
                : 'border-coral-400 bg-rose-50 text-rose-800'
              : 'border-blue-400 bg-blue-50 text-blue-800'
          )}
        >
          {value || '？'}
        </span>
        {exercise.after}
      </p>
      {exercise.hint && <p className="mt-2 text-sm italic text-ink-muted">{exercise.hint}</p>}

      {exercise.choices ? (
        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {exercise.choices.map((c) => (
            <li key={c}>
              <button
                type="button"
                disabled={locked}
                aria-pressed={value === c}
                onClick={() => {
                  feedback('select');
                  onAnswer({ kind: 'text', value: c });
                }}
                className={cn(
                  OPTION_BASE,
                  'text-center',
                  optionTone({
                    selected: value === c,
                    locked,
                    isCorrectOption: exercise.accepted.some((a) => a.toLowerCase() === c.toLowerCase()),
                  })
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <input
          value={value}
          disabled={locked}
          onChange={(e) => onAnswer({ kind: 'text', value: e.target.value })}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label={t('lesson.fillBlank')}
          className="mt-5 h-14 w-full rounded-xl2 border-2 border-surface-sunk bg-white px-4 text-[17px] text-ink outline-none focus:border-blue-400"
        />
      )}
    </div>
  );
}

export function WordOrderExerciseView({ exercise, answer, onAnswer, locked, result }: ExerciseProps<WordOrderExercise>) {
  const t = useT();
  const chosen = answer?.kind === 'tokens' ? answer.value : [];

  const remaining = useMemo(() => {
    const pool = [...exercise.tokens];
    for (const w of chosen) {
      const i = pool.indexOf(w);
      if (i >= 0) pool.splice(i, 1);
    }
    return pool;
  }, [exercise.tokens, chosen]);

  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <p className="mt-3 font-display text-xl font-bold leading-snug text-ink">{exercise.prompt}</p>

      <div
        className={cn(
          'mt-5 flex min-h-[4.5rem] flex-wrap content-start gap-2 rounded-xl2 border-2 border-dashed p-3',
          locked
            ? result?.correct
              ? 'border-mint-500 bg-emerald-50'
              : 'border-coral-400 bg-rose-50'
            : 'border-surface-sunk bg-surface-alt'
        )}
        aria-label={t('lesson.buildSentence')}
      >
        {chosen.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => {
              feedback('tap');
              onAnswer({ kind: 'tokens', value: chosen.filter((_, j) => j !== i) });
            }}
            className="rounded-xl bg-white px-3 py-2 text-[15px] font-medium text-ink shadow-card ring-1 ring-surface-sunk"
          >
            {w}
          </button>
        ))}
        {chosen.length === 0 && (
          <span className="self-center text-sm text-ink-muted">{t('lesson.buildSentence')}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {remaining.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => {
              feedback('select');
              onAnswer({ kind: 'tokens', value: [...chosen, w] });
            }}
            className="rounded-xl border-2 border-surface-sunk bg-white px-3 py-2 text-[15px] font-medium text-ink-soft transition hover:border-blue-300 hover:text-ink"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MatchExerciseView({ exercise, answer, onAnswer, locked }: ExerciseProps<MatchExercise>) {
  const pairs = answer?.kind === 'pairs' ? answer.value : {};
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const rights = useMemo(
    () => [...exercise.pairs.map((p) => p.right)].sort((a, b) => a.localeCompare(b)),
    [exercise.pairs]
  );
  const usedRights = new Set(Object.values(pairs));

  function choose(right: string) {
    if (!activeLeft) return;
    feedback('select');
    const next = { ...pairs };
    for (const [k, v] of Object.entries(next)) if (v === right) delete next[k];
    next[activeLeft] = right;
    onAnswer({ kind: 'pairs', value: next });
    setActiveLeft(null);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ul className="space-y-2.5">
          {exercise.pairs.map((p) => {
            const assigned = pairs[p.left];
            const correct = assigned === p.right;
            return (
              <li key={p.left}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    feedback('tap');
                    setActiveLeft(activeLeft === p.left ? null : p.left);
                  }}
                  className={cn(
                    OPTION_BASE,
                    'py-3',
                    locked
                      ? correct
                        ? 'border-mint-500 bg-emerald-50 text-emerald-900'
                        : 'border-coral-400 bg-rose-50 text-rose-900'
                      : activeLeft === p.left
                        ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900'
                        : assigned
                          ? 'border-blue-200 bg-white text-ink'
                          : 'border-surface-sunk text-ink-soft'
                  )}
                >
                  <span className="block font-semibold">{p.left}</span>
                  {assigned && <span className="mt-0.5 block text-xs text-ink-muted">{assigned}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2.5">
          {rights.map((r) => (
            <li key={r}>
              <button
                type="button"
                disabled={locked || (usedRights.has(r) && !activeLeft)}
                onClick={() => choose(r)}
                className={cn(
                  OPTION_BASE,
                  'py-3',
                  usedRights.has(r)
                    ? 'border-surface-sunk bg-surface-alt text-ink-muted'
                    : 'border-surface-sunk text-ink-soft hover:border-blue-200 hover:text-ink'
                )}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SpeakExerciseView({ exercise, answer, onAnswer, locked, result }: ExerciseProps<SpeakExercise>) {
  const t = useT();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(false);
  const transcript = answer?.kind === 'text' ? answer.value : '';
  const available = recognitionAvailable();

  async function start() {
    setListening(true);
    setError(false);
    try {
      const said = await listenOnce();
      onAnswer({ kind: 'text', value: said });
    } catch {
      setError(true);
    } finally {
      setListening(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <p className="mt-4 font-display text-2xl font-extrabold leading-snug tracking-tight text-ink">
        {exercise.text}
      </p>
      <p className="mt-1 text-sm italic text-ink-muted">{exercise.translation}</p>

      <button
        type="button"
        onClick={() => {
          feedback('tap');
          speak(exercise.text);
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-xl2 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
      >
        <IconSpeaker /> {t('lesson.tapToListen')}
      </button>

      {available && !error ? (
        <div className="mt-5">
          <Button
            block
            size="lg"
            variant={listening ? 'sun' : 'primary'}
            disabled={locked || listening}
            onClick={() => void start()}
            icon={<IconMic />}
          >
            {listening ? t('lesson.micListening') : t('lesson.micStart')}
          </Button>
          {transcript && (
            <p
              className={cn(
                'mt-3 rounded-xl2 p-3 text-sm',
                locked
                  ? result?.correct
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                  : 'bg-surface-alt text-ink-soft'
              )}
            >
              « {transcript} »
            </p>
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-xl2 bg-surface-alt p-4 text-sm text-ink-muted">
          {t('lesson.speakUnavailable')}
        </p>
      )}
    </div>
  );
}
