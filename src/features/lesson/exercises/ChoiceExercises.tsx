import { useEffect } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { speak, speechAvailable } from '@/lib/tts';
import { feedback } from '@/lib/feedback';
import { IconSpeaker } from '@/ds/icons';
import type { MCQExercise, ReadingExercise, TrueFalseExercise } from '@/engine/types';
import { OPTION_BASE, optionTone, type ExerciseProps } from './shared';

export function ChoiceExercise({ exercise, answer, onAnswer, locked }: ExerciseProps<MCQExercise>) {
  const t = useT();
  const selected = answer?.kind === 'choice' ? answer.index : -1;
  const isListening = exercise.type === 'listenChoose';

  useEffect(() => {
    if (isListening && exercise.audio && speechAvailable()) speak(exercise.audio);
  }, [exercise.id, exercise.audio, isListening]);

  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>

      {isListening ? (
        <button
          type="button"
          onClick={() => {
            feedback('tap');
            if (exercise.audio) speak(exercise.audio);
          }}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl2 bg-blue-500 px-5 py-6 font-display text-lg font-bold text-white shadow-press transition hover:bg-blue-600"
        >
          <IconSpeaker width={26} height={26} /> {t('lesson.tapToListen')}
        </button>
      ) : (
        exercise.prompt && (
          <div className="mt-3 flex items-start gap-2">
            <p className="font-display text-2xl font-extrabold leading-snug tracking-tight text-ink">
              {exercise.prompt}
            </p>
            {exercise.audio && speechAvailable() && (
              <button
                type="button"
                aria-label={t('lesson.tapToListen')}
                onClick={() => {
                  feedback('tap');
                  speak(exercise.audio!);
                }}
                className="mt-1 rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
              >
                <IconSpeaker />
              </button>
            )}
          </div>
        )
      )}
      {exercise.subPrompt && <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{exercise.subPrompt}</p>}

      <ul className="mt-5 space-y-2.5">
        {exercise.options.map((opt, i) => (
          <li key={`${opt}-${i}`}>
            <button
              type="button"
              disabled={locked}
              aria-pressed={selected === i}
              onClick={() => {
                feedback('select');
                onAnswer({ kind: 'choice', index: i });
              }}
              className={cn(
                OPTION_BASE,
                optionTone({ selected: selected === i, locked, isCorrectOption: i === exercise.answer })
              )}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>

      {isListening && locked && exercise.audio && (
        <p className="mt-3 text-center text-sm text-ink-muted">« {exercise.audio} »</p>
      )}
    </div>
  );
}

export function ReadingExerciseView({ exercise, answer, onAnswer, locked }: ExerciseProps<ReadingExercise>) {
  const selected = answer?.kind === 'choice' ? answer.index : -1;
  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      <article className="mt-3 rounded-xl2 bg-surface-alt p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
          {exercise.passageTitle}
        </h3>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">{exercise.passage}</p>
      </article>
      <p className="mt-5 font-display text-lg font-bold text-ink">{exercise.prompt}</p>
      <ul className="mt-3 space-y-2.5">
        {exercise.options.map((opt, i) => (
          <li key={`${opt}-${i}`}>
            <button
              type="button"
              disabled={locked}
              aria-pressed={selected === i}
              onClick={() => {
                feedback('select');
                onAnswer({ kind: 'choice', index: i });
              }}
              className={cn(
                OPTION_BASE,
                optionTone({ selected: selected === i, locked, isCorrectOption: i === exercise.answer })
              )}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrueFalseExerciseView({ exercise, answer, onAnswer, locked }: ExerciseProps<TrueFalseExercise>) {
  const t = useT();
  const value = answer?.kind === 'boolean' ? answer.value : null;
  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{exercise.instruction}</p>
      {exercise.context && (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl2 bg-surface-alt p-4 font-sans text-[15px] leading-relaxed text-ink">
          {exercise.context}
        </pre>
      )}
      <p className="mt-5 font-display text-xl font-bold leading-snug text-ink">{exercise.statement}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={locked}
            aria-pressed={value === v}
            onClick={() => {
              feedback('select');
              onAnswer({ kind: 'boolean', value: v });
            }}
            className={cn(
              OPTION_BASE,
              'text-center font-semibold',
              optionTone({ selected: value === v, locked, isCorrectOption: v === exercise.answer })
            )}
          >
            {v ? t('lesson.true') : t('lesson.false')}
          </button>
        ))}
      </div>
    </div>
  );
}
