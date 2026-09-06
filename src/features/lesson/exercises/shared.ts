import type { Answer } from '@/engine/grading';
import type { Exercise, GradeResult } from '@/engine/types';

export interface ExerciseProps<E extends Exercise = Exercise> {
  exercise: E;
  answer: Answer | null;
  onAnswer: (a: Answer) => void;
  /** Soumet directement (utilisé quand un clic vaut validation). */
  onSubmitNow?: () => void;
  locked: boolean;
  result: GradeResult | null;
}

export const OPTION_BASE =
  'w-full rounded-xl2 border-2 px-4 py-3.5 text-left text-[15px] transition-all duration-150 disabled:cursor-default';

export function optionTone(params: {
  selected: boolean;
  locked: boolean;
  isCorrectOption: boolean;
}): string {
  const { selected, locked, isCorrectOption } = params;
  if (!locked) {
    return selected
      ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900'
      : 'border-surface-sunk text-ink-soft hover:border-blue-200 hover:text-ink';
  }
  if (isCorrectOption) return 'border-mint-500 bg-emerald-50 font-semibold text-emerald-900';
  if (selected) return 'border-coral-500 bg-rose-50 font-semibold text-rose-900';
  return 'border-surface-sunk text-ink-muted opacity-70';
}
