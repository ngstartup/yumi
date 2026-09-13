import type { Difficulty, SkillKey } from '@/content/types';

export type ExerciseType =
  | 'mcq'
  | 'translate'
  | 'fillBlank'
  | 'wordOrder'
  | 'match'
  | 'trueFalse'
  | 'reading'
  | 'listenChoose'
  | 'dictation'
  | 'findError'
  | 'speak';

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  /** Item de contenu dont l'exercice est issu — clé du système de répétition. */
  itemId: string;
  /** Notion travaillée (topicId de grammaire, ou l'item de vocabulaire). */
  conceptId: string;
  /** Libellé lisible de la notion, quand elle en a un — le titre du point de
   *  grammaire. `conceptId` est un identifiant technique : il n'a jamais rien à
   *  faire à l'écran. */
  concept?: string;
  skill: SkillKey;
  difficulty: Difficulty;
  instruction: string;
  explanation: string;
  /** Texte lu par la synthèse vocale, si l'exercice comporte de l'audio. */
  audio?: string;
}

export interface MCQExercise extends ExerciseBase {
  type: 'mcq' | 'listenChoose' | 'findError';
  prompt: string;
  subPrompt?: string;
  options: string[];
  answer: number;
}

export interface ReadingExercise extends ExerciseBase {
  type: 'reading';
  passageTitle: string;
  passage: string;
  prompt: string;
  options: string[];
  answer: number;
}

export interface TranslateExercise extends ExerciseBase {
  type: 'translate';
  direction: 'fr-en' | 'en-fr';
  source: string;
  accepted: string[];
}

export interface FillBlankExercise extends ExerciseBase {
  type: 'fillBlank';
  before: string;
  after: string;
  accepted: string[];
  hint?: string;
  choices?: string[];
}

export interface WordOrderExercise extends ExerciseBase {
  type: 'wordOrder';
  prompt: string;
  tokens: string[];
  answer: string;
}

export interface MatchExercise extends ExerciseBase {
  type: 'match';
  pairs: { left: string; right: string }[];
}

export interface TrueFalseExercise extends ExerciseBase {
  type: 'trueFalse';
  statement: string;
  context?: string;
  answer: boolean;
}

export interface DictationExercise extends ExerciseBase {
  type: 'dictation';
  accepted: string[];
}

export interface SpeakExercise extends ExerciseBase {
  type: 'speak';
  text: string;
  translation: string;
}

export type Exercise =
  | MCQExercise
  | ReadingExercise
  | TranslateExercise
  | FillBlankExercise
  | WordOrderExercise
  | MatchExercise
  | TrueFalseExercise
  | DictationExercise
  | SpeakExercise;

export interface GradeResult {
  correct: boolean;
  /** Réponse attendue, formatée pour l'affichage. */
  expected: string;
  explanation: string;
  /** Traduction ou règle affichée en complément du feedback. */
  hint?: string;
  /** Vrai lorsque la réponse est correcte à une faute de frappe près. */
  nearMiss?: boolean;
}
