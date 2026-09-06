import { isTypoMatch, normalize, tokenizeWords } from '@/lib/text';
import type { Exercise, GradeResult } from './types';

/** Réponse fournie par l'utilisateur, selon le type d'exercice. */
export type Answer =
  | { kind: 'choice'; index: number }
  | { kind: 'text'; value: string }
  | { kind: 'tokens'; value: string[] }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'pairs'; value: Record<string, string> }
  | { kind: 'skipped' };

/**
 * Correction centralisée : un seul endroit décide si une réponse est juste, et
 * produit le feedback pédagogique (bonne réponse + explication + règle).
 */
export function grade(exercise: Exercise, answer: Answer): GradeResult {
  if (answer.kind === 'skipped') {
    return { correct: false, expected: expectedOf(exercise), explanation: exercise.explanation };
  }

  switch (exercise.type) {
    case 'mcq':
    case 'listenChoose':
    case 'findError':
    case 'reading': {
      const idx = answer.kind === 'choice' ? answer.index : -1;
      return {
        correct: idx === exercise.answer,
        expected: exercise.options[exercise.answer],
        explanation: exercise.explanation,
      };
    }

    case 'trueFalse': {
      const v = answer.kind === 'boolean' ? answer.value : null;
      return {
        correct: v === exercise.answer,
        expected: exercise.answer ? 'Vrai' : 'Faux',
        explanation: exercise.explanation,
      };
    }

    case 'translate':
    case 'dictation': {
      const given = answer.kind === 'text' ? answer.value : '';
      const exact = exercise.accepted.some((a) => normalize(a) === normalize(given));
      const typo = !exact && exercise.accepted.some((a) => isTypoMatch(given, a));
      return {
        correct: exact || typo,
        nearMiss: typo,
        expected: exercise.accepted[0],
        explanation: typo
          ? `Presque : attention à l’orthographe. ${exercise.explanation}`
          : exercise.explanation,
      };
    }

    case 'fillBlank': {
      const given = answer.kind === 'text' ? answer.value : '';
      const exact = exercise.accepted.some((a) => normalize(a) === normalize(given));
      const typo = !exact && exercise.accepted.some((a) => isTypoMatch(given, a));
      return {
        correct: exact || typo,
        nearMiss: typo,
        expected: exercise.accepted[0],
        explanation: exercise.explanation,
        hint: exercise.hint,
      };
    }

    case 'wordOrder': {
      const given = answer.kind === 'tokens' ? answer.value.join(' ') : '';
      return {
        correct: normalize(given) === normalize(exercise.answer),
        expected: exercise.answer,
        explanation: exercise.explanation,
      };
    }

    case 'match': {
      const map = answer.kind === 'pairs' ? answer.value : {};
      const correct = exercise.pairs.every((p) => map[p.left] === p.right);
      return {
        correct,
        expected: exercise.pairs.map((p) => `${p.left} → ${p.right}`).join(' · '),
        explanation: exercise.explanation,
      };
    }

    case 'speak': {
      const given = answer.kind === 'text' ? answer.value : '';
      // Tolérance élevée : la reconnaissance vocale ponctue mal et confond les
      // homophones. On compare les mots pleins, sans exiger un score parfait.
      const target = tokenizeWords(normalize(exercise.text));
      const said = new Set(tokenizeWords(normalize(given)));
      const hits = target.filter((w) => said.has(w)).length;
      const ratio = target.length === 0 ? 0 : hits / target.length;
      return {
        correct: ratio >= 0.6,
        expected: exercise.text,
        explanation:
          ratio >= 0.6
            ? 'Prononciation reconnue.'
            : `Nous avons entendu « ${given || '…'} ». Réessayez en articulant chaque mot.`,
        hint: exercise.translation,
      };
    }
  }
}

export function expectedOf(exercise: Exercise): string {
  switch (exercise.type) {
    case 'mcq':
    case 'listenChoose':
    case 'findError':
    case 'reading':
      return exercise.options[exercise.answer];
    case 'trueFalse':
      return exercise.answer ? 'Vrai' : 'Faux';
    case 'translate':
    case 'dictation':
    case 'fillBlank':
      return exercise.accepted[0];
    case 'wordOrder':
      return exercise.answer;
    case 'match':
      return exercise.pairs.map((p) => `${p.left} → ${p.right}`).join(' · ');
    case 'speak':
      return exercise.text;
  }
}
