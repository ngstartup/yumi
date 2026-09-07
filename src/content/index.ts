import { buildSections } from './builder';
import { GENERAL_A1 } from './general-a1';
import { GENERAL_A2 } from './general-a2';
import { GENERAL_B1 } from './general-b1';
import { BUSINESS_B1 } from './business';
import { ACADEMIC_B1 } from './academic';
import { TRAVEL_A2 } from './travel';
import { INTERVIEW_B1 } from './interview';
import {
  CEFR_ORDER,
  type CEFR,
  type Lesson,
  type Track,
  type TrackKey,
  type TrackMeta,
  type Unit,
} from './types';

export const TRACK_META: Record<TrackKey, TrackMeta> = {
  general: {
    id: 'general',
    name: 'Anglais général',
    tagline: 'La langue de tous les jours',
    description:
      'Saluer, se présenter, parler de sa famille, faire ses courses, se déplacer, raconter sa journée. Le socle indispensable, du niveau A1 au niveau C2.',
    icon: '🌍',
  },
  business: {
    id: 'business',
    name: 'Business English',
    tagline: 'L’anglais du travail',
    description:
      'Réunions, e-mails, négociation, présentations. Les formules exactes qui font la différence en contexte professionnel.',
    icon: '💼',
  },
  academic: {
    id: 'academic',
    name: 'Anglais académique',
    tagline: 'Étudier et publier',
    description:
      'Lexique de la recherche, argumentation, nuance, lecture d’articles scientifiques et rédaction universitaire.',
    icon: '🎓',
  },
  travel: {
    id: 'travel',
    name: 'Anglais pour voyager',
    tagline: 'Partir sans stress',
    description:
      'Aéroport, hôtel, transports, orientation, imprévus. Tout ce qui se dit réellement en déplacement.',
    icon: '✈️',
  },
  interview: {
    id: 'interview',
    name: 'Entretien d’embauche',
    tagline: 'Décrocher le poste',
    description:
      'Se présenter, valoriser son parcours, répondre aux questions difficiles et poser les bonnes questions.',
    icon: '🎤',
  },
};

/** Registry — the single source of truth for every track shipped in the app.
 *  Adding a level or a track means adding an entry here; nothing else changes. */
export const TRACKS: Record<TrackKey, Track> = {
  general: {
    ...TRACK_META.general,
    levels: [
      { level: 'A1', sections: buildSections(GENERAL_A1, 'general', 'A1') },
      { level: 'A2', sections: buildSections(GENERAL_A2, 'general', 'A2') },
      { level: 'B1', sections: buildSections(GENERAL_B1, 'general', 'B1') },
    ],
  },
  business: {
    ...TRACK_META.business,
    levels: [{ level: 'B1', sections: buildSections(BUSINESS_B1, 'business', 'B1') }],
  },
  academic: {
    ...TRACK_META.academic,
    levels: [{ level: 'B1', sections: buildSections(ACADEMIC_B1, 'academic', 'B1') }],
  },
  travel: {
    ...TRACK_META.travel,
    levels: [{ level: 'A2', sections: buildSections(TRAVEL_A2, 'travel', 'A2') }],
  },
  interview: {
    ...TRACK_META.interview,
    levels: [{ level: 'B1', sections: buildSections(INTERVIEW_B1, 'interview', 'B1') }],
  },
};

export const TRACK_KEYS = Object.keys(TRACKS) as TrackKey[];

// ---------------------------------------------------------------------------
// Indexes — built once, O(1) lookups everywhere else in the app.
// ---------------------------------------------------------------------------

const lessonIndex = new Map<string, Lesson>();
const unitIndex = new Map<string, Unit>();
const orderedLessonsByTrack = new Map<TrackKey, Lesson[]>();
const orderedUnitsByTrack = new Map<TrackKey, Unit[]>();

for (const key of TRACK_KEYS) {
  const lessons: Lesson[] = [];
  const units: Unit[] = [];
  for (const block of TRACKS[key].levels) {
    for (const section of block.sections) {
      for (const unit of section.units) {
        unitIndex.set(unit.id, unit);
        units.push(unit);
        for (const lesson of unit.lessons) {
          lessonIndex.set(lesson.id, lesson);
          lessons.push(lesson);
        }
      }
    }
  }
  orderedLessonsByTrack.set(key, lessons);
  orderedUnitsByTrack.set(key, units);
}

export function getLesson(id: string): Lesson | undefined {
  return lessonIndex.get(id);
}

export function getUnit(id: string): Unit | undefined {
  return unitIndex.get(id);
}

export function lessonsOfTrack(track: TrackKey): Lesson[] {
  return orderedLessonsByTrack.get(track) ?? [];
}

export function unitsOfTrack(track: TrackKey): Unit[] {
  return orderedUnitsByTrack.get(track) ?? [];
}

export function allLessons(): Lesson[] {
  return [...lessonIndex.values()];
}

export function levelsOfTrack(track: TrackKey): CEFR[] {
  return TRACKS[track].levels.map((l) => l.level);
}

/** Levels declared by the CEFR framework but not yet populated with content.
 *  The UI shows them as "à venir" so the full A1→C2 path is always visible. */
export function upcomingLevels(track: TrackKey): CEFR[] {
  const have = new Set(levelsOfTrack(track));
  return CEFR_ORDER.filter((l) => !have.has(l));
}

/** Ordered lesson list starting from the learner's entry level. Lessons below
 *  that level stay available (for revision) but are not the default path. */
export function lessonsFromLevel(track: TrackKey, level: CEFR): Lesson[] {
  const idx = CEFR_ORDER.indexOf(level);
  const lessons = lessonsOfTrack(track);
  const at = lessons.filter((l) => CEFR_ORDER.indexOf(l.level) >= idx);
  return at.length > 0 ? at : lessons;
}

/**
 * Un débutant qui vise le business ne doit pas atterrir directement sur du B1 :
 * tant que son niveau est en dessous du plus bas niveau pourvu dans le parcours
 * choisi, on le démarre sur l'anglais général et son objectif reste enregistré.
 */
export function trackForLevel(goal: TrackKey, level: CEFR): TrackKey {
  const levels = levelsOfTrack(goal);
  if (levels.length === 0) return 'general';
  const lowest = levels[0];
  return CEFR_ORDER.indexOf(level) >= CEFR_ORDER.indexOf(lowest) ? goal : 'general';
}

export function countVocabInTrack(track: TrackKey): number {
  return lessonsOfTrack(track).reduce(
    (n, l) => n + l.items.filter((i) => i.kind === 'vocab').length,
    0
  );
}

export * from './types';
