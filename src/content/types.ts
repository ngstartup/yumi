/** Content model.
 *
 * Pedagogical content is DATA, never JSX. Every lesson is a bag of typed
 * "items" (vocabulary, model sentences, grammar points, reading passages,
 * dialogues). The engine turns those items into concrete exercises at runtime,
 * which is why one lesson can produce a QCM today and a dictation tomorrow
 * without any content being rewritten.
 */

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const CEFR_ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type SkillKey = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';
export const SKILL_KEYS: SkillKey[] = ['vocabulary', 'grammar', 'reading', 'listening', 'writing', 'speaking'];

/** 1 facile · 2 moyen · 3 difficile · 4 avancé · 5 expert */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type TrackKey = 'general' | 'business' | 'academic' | 'travel' | 'interview';

export interface VocabItem {
  id: string;
  kind: 'vocab';
  en: string;
  fr: string;
  pos?: 'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'prep';
  example?: { en: string; fr: string };
  difficulty: Difficulty;
}

export interface SentenceItem {
  id: string;
  kind: 'sentence';
  en: string;
  fr: string;
  note?: string;
  difficulty: Difficulty;
}

export interface GrammarItem {
  id: string;
  kind: 'grammar';
  topicId: string;
  title: string;
  /** Explication en langue d'interface (français au lancement). */
  rule: string;
  reference: { en: string; fr: string };
  /** Formes fautives plausibles — servent de distracteurs ET d'exercices « repérez l'erreur ». */
  wrong: string[];
  /** Mot ou groupe de mots à retrouver dans la phrase de référence. */
  blank?: string;
  difficulty: Difficulty;
}

export interface ReadingQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ReadingItem {
  id: string;
  kind: 'reading';
  title: string;
  text: string;
  questions: ReadingQuestion[];
  difficulty: Difficulty;
}

export interface DialogueLine {
  speaker: string;
  en: string;
  fr: string;
}

export interface DialogueItem {
  id: string;
  kind: 'dialogue';
  context: string;
  lines: DialogueLine[];
  /** Vrai/faux dérivés du dialogue. */
  statements?: { en: string; isTrue: boolean; explanation: string }[];
  difficulty: Difficulty;
}

export type LessonItem = VocabItem | SentenceItem | GrammarItem | ReadingItem | DialogueItem;

export interface GrammarNote {
  title: string;
  body: string;
  examples?: { en: string; fr: string }[];
}

export interface Lesson {
  id: string;
  unitId: string;
  trackId: TrackKey;
  level: CEFR;
  title: string;
  /** Objectif pédagogique, affiché en introduction de la leçon. */
  objective: string;
  intro: string;
  note?: GrammarNote;
  items: LessonItem[];
  skills: SkillKey[];
  difficulty: Difficulty;
  /** Nombre d'exercices visé dans une session standard. */
  targetExercises: number;
  estimatedMinutes: number;
}

export interface Unit {
  id: string;
  sectionId: string;
  trackId: TrackKey;
  level: CEFR;
  title: string;
  subtitle: string;
  icon: string;
  lessons: Lesson[];
}

export interface Section {
  id: string;
  level: CEFR;
  title: string;
  units: Unit[];
}

export interface LevelBlock {
  level: CEFR;
  sections: Section[];
}

export interface Track {
  id: TrackKey;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  /** Niveaux effectivement pourvus en contenu. Les autres sont « à venir ». */
  levels: LevelBlock[];
}

export interface TrackMeta {
  id: TrackKey;
  name: string;
  tagline: string;
  description: string;
  icon: string;
}
