import type {
  CEFR,
  Difficulty,
  DialogueItem,
  GrammarItem,
  GrammarNote,
  Lesson,
  LessonItem,
  ReadingItem,
  Section,
  SentenceItem,
  SkillKey,
  TrackKey,
  Unit,
  VocabItem,
} from './types';

/**
 * Authoring helpers.
 *
 * These keep the content files readable — a lesson is declared as plain tuples
 * and the builder attaches stable ids, levels and difficulties. Adding content
 * never requires touching the engine or any component.
 */

export type VocabTuple = [en: string, fr: string, pos?: VocabItem['pos'], exampleEn?: string, exampleFr?: string];
export type SentenceTuple = [en: string, fr: string, note?: string];

export interface GrammarSpec {
  topicId: string;
  title: string;
  rule: string;
  en: string;
  fr: string;
  wrong: string[];
  blank?: string;
}

export interface LessonSpec {
  id: string;
  title: string;
  objective: string;
  intro: string;
  note?: GrammarNote;
  vocab?: VocabTuple[];
  sentences?: SentenceTuple[];
  grammar?: GrammarSpec[];
  reading?: Omit<ReadingItem, 'id' | 'kind' | 'difficulty'>;
  dialogue?: Omit<DialogueItem, 'id' | 'kind' | 'difficulty'>;
  difficulty?: Difficulty;
  targetExercises?: number;
  estimatedMinutes?: number;
  skills?: SkillKey[];
}

export interface UnitSpec {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  lessons: LessonSpec[];
}

export interface SectionSpec {
  id: string;
  title: string;
  units: UnitSpec[];
}

function buildLesson(spec: LessonSpec, unitId: string, trackId: TrackKey, level: CEFR): Lesson {
  const difficulty = spec.difficulty ?? defaultDifficulty(level);
  const items: LessonItem[] = [];

  (spec.vocab ?? []).forEach((v, i) => {
    const [en, fr, pos, exEn, exFr] = v;
    const item: VocabItem = {
      id: `${spec.id}-v${i + 1}`,
      kind: 'vocab',
      en,
      fr,
      pos,
      difficulty,
      ...(exEn && exFr ? { example: { en: exEn, fr: exFr } } : {}),
    };
    items.push(item);
  });

  (spec.sentences ?? []).forEach((s, i) => {
    const [en, fr, note] = s;
    const item: SentenceItem = {
      id: `${spec.id}-s${i + 1}`,
      kind: 'sentence',
      en,
      fr,
      note,
      difficulty: clamp(difficulty + 1),
    };
    items.push(item);
  });

  (spec.grammar ?? []).forEach((g, i) => {
    const item: GrammarItem = {
      id: `${spec.id}-g${i + 1}`,
      kind: 'grammar',
      topicId: g.topicId,
      title: g.title,
      rule: g.rule,
      reference: { en: g.en, fr: g.fr },
      wrong: g.wrong,
      blank: g.blank,
      difficulty: clamp(difficulty + 1),
    };
    items.push(item);
  });

  if (spec.reading) {
    items.push({
      id: `${spec.id}-r1`,
      kind: 'reading',
      difficulty: clamp(difficulty + 1),
      ...spec.reading,
    });
  }

  if (spec.dialogue) {
    items.push({
      id: `${spec.id}-d1`,
      kind: 'dialogue',
      difficulty,
      ...spec.dialogue,
    });
  }

  const skills = spec.skills ?? inferSkills(items);

  return {
    id: spec.id,
    unitId,
    trackId,
    level,
    title: spec.title,
    objective: spec.objective,
    intro: spec.intro,
    note: spec.note,
    items,
    skills,
    difficulty,
    targetExercises: spec.targetExercises ?? Math.min(10, Math.max(5, Math.round(items.length * 0.9))),
    estimatedMinutes: spec.estimatedMinutes ?? 5,
  };
}

function inferSkills(items: LessonItem[]): SkillKey[] {
  const s = new Set<SkillKey>(['vocabulary', 'listening']);
  for (const it of items) {
    if (it.kind === 'grammar') s.add('grammar');
    if (it.kind === 'reading') s.add('reading');
    if (it.kind === 'sentence') s.add('writing');
    if (it.kind === 'dialogue') s.add('listening');
  }
  return [...s];
}

function defaultDifficulty(level: CEFR): Difficulty {
  const map: Record<CEFR, Difficulty> = { A1: 1, A2: 2, B1: 3, B2: 3, C1: 4, C2: 5 };
  return map[level];
}

function clamp(n: number): Difficulty {
  return Math.max(1, Math.min(5, n)) as Difficulty;
}

export function buildSections(
  specs: SectionSpec[],
  trackId: TrackKey,
  level: CEFR
): Section[] {
  return specs.map((sec) => ({
    id: sec.id,
    level,
    title: sec.title,
    units: sec.units.map<Unit>((u) => ({
      id: u.id,
      sectionId: sec.id,
      trackId,
      level,
      title: u.title,
      subtitle: u.subtitle,
      icon: u.icon,
      lessons: u.lessons.map((l) => buildLesson(l, u.id, trackId, level)),
    })),
  }));
}
