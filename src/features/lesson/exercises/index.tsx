import type { Exercise } from '@/engine/types';
import type { ExerciseProps } from './shared';
import { ChoiceExercise, ReadingExerciseView, TrueFalseExerciseView } from './ChoiceExercises';
import {
  DictationExerciseView,
  FillBlankExerciseView,
  MatchExerciseView,
  SpeakExerciseView,
  TranslateExerciseView,
  WordOrderExerciseView,
} from './InputExercises';

/** Aiguillage unique : ajouter un type d'exercice = ajouter un cas ici. */
export function ExerciseView(props: ExerciseProps<Exercise>) {
  const { exercise } = props;
  switch (exercise.type) {
    case 'mcq':
    case 'listenChoose':
    case 'findError':
      return <ChoiceExercise {...props} exercise={exercise} />;
    case 'reading':
      return <ReadingExerciseView {...props} exercise={exercise} />;
    case 'trueFalse':
      return <TrueFalseExerciseView {...props} exercise={exercise} />;
    case 'translate':
      return <TranslateExerciseView {...props} exercise={exercise} />;
    case 'dictation':
      return <DictationExerciseView {...props} exercise={exercise} />;
    case 'fillBlank':
      return <FillBlankExerciseView {...props} exercise={exercise} />;
    case 'wordOrder':
      return <WordOrderExerciseView {...props} exercise={exercise} />;
    case 'match':
      return <MatchExerciseView {...props} exercise={exercise} />;
    case 'speak':
      return <SpeakExerciseView {...props} exercise={exercise} />;
  }
}

/** Une réponse est-elle exploitable (bouton « Vérifier » actif) ? */
export function hasAnswer(props: Pick<ExerciseProps, 'exercise' | 'answer'>): boolean {
  const { exercise, answer } = props;
  if (!answer) return false;
  switch (answer.kind) {
    case 'choice':
      return answer.index >= 0;
    case 'boolean':
      return true;
    case 'text':
      return answer.value.trim().length > 0;
    case 'tokens':
      return answer.value.length > 0;
    case 'pairs':
      return exercise.type === 'match'
        ? Object.keys(answer.value).length === exercise.pairs.length
        : Object.keys(answer.value).length > 0;
    default:
      return false;
  }
}

export type { ExerciseProps };
