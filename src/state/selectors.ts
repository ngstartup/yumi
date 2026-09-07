import {
  CEFR_ORDER,
  SKILL_KEYS,
  TRACKS,
  getLesson,
  lessonsOfTrack,
  type CEFR,
  type Lesson,
  type SkillKey,
  type TrackKey,
  type Unit,
} from '@/content';
import type { DailyRecord, LessonProgressRecord, MemoryRecord } from '@/data/schema';
import { masteryOf } from '@/engine/srs';
import { lastNDays } from '@/engine/streak';

export interface UnitView {
  unit: Unit;
  completedLessons: number;
  totalLessons: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  percent: number;
}

export interface LessonView {
  lesson: Lesson;
  status: 'locked' | 'available' | 'completed';
  bestAccuracy: number;
}

/**
 * Construit la carte de progression d'un parcours.
 *
 * Règle de déverrouillage : la première leçon non terminée d'une unité est
 * ouverte, la suivante attend. Une unité s'ouvre quand la précédente est
 * terminée à 100 %. Les unités verrouillées restent visibles — l'apprenant doit
 * voir où il va.
 */
export function buildPath(
  trackId: TrackKey,
  progress: Record<string, LessonProgressRecord>
): { level: CEFR; sectionTitle: string; units: UnitView[] }[] {
  const out: { level: CEFR; sectionTitle: string; units: UnitView[] }[] = [];
  let previousUnitComplete = true;

  for (const block of TRACKS[trackId].levels) {
    for (const section of block.sections) {
      const units: UnitView[] = [];
      for (const unit of section.units) {
        const completed = unit.lessons.filter((l) => progress[l.id]?.status === 'completed').length;
        const total = unit.lessons.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        let status: UnitView['status'];
        if (completed >= total && total > 0) status = 'completed';
        else if (!previousUnitComplete) status = 'locked';
        else if (completed > 0) status = 'in_progress';
        else status = 'available';
        units.push({ unit, completedLessons: completed, totalLessons: total, status, percent });
        previousUnitComplete = completed >= total && total > 0;
      }
      out.push({ level: block.level, sectionTitle: section.title, units });
    }
  }
  return out;
}

export function lessonViews(unit: Unit, progress: Record<string, LessonProgressRecord>): LessonView[] {
  let unlocked = true;
  return unit.lessons.map((lesson) => {
    const p = progress[lesson.id];
    const done = p?.status === 'completed';
    const view: LessonView = {
      lesson,
      status: done ? 'completed' : unlocked ? 'available' : 'locked',
      bestAccuracy: p?.bestAccuracy ?? 0,
    };
    if (!done) unlocked = false;
    return view;
  });
}

/** Prochaine leçon à faire dans le parcours actif. */
export function nextLesson(
  trackId: TrackKey,
  level: CEFR,
  progress: Record<string, LessonProgressRecord>
): Lesson | null {
  const lessons = lessonsOfTrack(trackId);
  const startIdx = CEFR_ORDER.indexOf(level);
  const preferred = lessons.filter((l) => CEFR_ORDER.indexOf(l.level) >= startIdx);
  const pool = preferred.length > 0 ? preferred : lessons;
  return pool.find((l) => progress[l.id]?.status !== 'completed') ?? null;
}

/**
 * Leçon qui suit immédiatement celle-ci dans l'ordre du parcours.
 *
 * C'est la destination attendue après « Continuer » à la fin d'une leçon.
 * `nextLesson` ne convient pas ici : elle renvoie la première leçon *non
 * terminée*, or au moment où l'écran de fin se construit la leçon courante
 * n'est pas encore enregistrée comme terminée — elle se désignait donc
 * elle-même, le bouton basculait sur « retour au parcours » et renvoyait au
 * sommaire de l'unité au lieu d'enchaîner.
 *
 * Ne dépend d'aucune progression : l'ordre du parcours suffit, et le résultat
 * est le même avant et après l'enregistrement de la leçon.
 */
export function lessonAfter(trackId: TrackKey, lessonId: string): Lesson | null {
  const lessons = lessonsOfTrack(trackId);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return null;
  return lessons[idx + 1] ?? null;
}

export function trackCompletion(
  trackId: TrackKey,
  progress: Record<string, LessonProgressRecord>
): { done: number; total: number; percent: number } {
  const lessons = lessonsOfTrack(trackId);
  const done = lessons.filter((l) => progress[l.id]?.status === 'completed').length;
  return {
    done,
    total: lessons.length,
    percent: lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100),
  };
}

/** Maîtrise par compétence, dérivée de la mémoire de répétition espacée. */
export function skillMastery(memories: Record<string, MemoryRecord>): Record<SkillKey, number> {
  const out = {} as Record<SkillKey, number>;
  for (const skill of SKILL_KEYS) {
    const rows = Object.values(memories).filter((m) => m.skill === skill && m.attempts > 0);
    out[skill] = rows.length === 0 ? 0 : Math.round(rows.reduce((n, m) => n + masteryOf(m), 0) / rows.length);
  }
  return out;
}

export function weeklyXp(history: DailyRecord[]): { day: string; xp: number }[] {
  const days = lastNDays(7);
  const map = new Map(history.map((d) => [d.day, d.xp]));
  return days.map((day) => ({ day, xp: map.get(day) ?? 0 }));
}

export function totalWeekXp(history: DailyRecord[]): number {
  return weeklyXp(history).reduce((n, d) => n + d.xp, 0);
}

export function successRate(history: DailyRecord[]): number {
  const answered = history.reduce((n, d) => n + d.exercisesAnswered, 0);
  const correct = history.reduce((n, d) => n + d.correctAnswers, 0);
  return answered === 0 ? 0 : Math.round((correct / answered) * 100);
}

/** Notions dues aujourd'hui, avec la leçon d'origine — alimente la session de révision. */
export function dueForReview(memories: Record<string, MemoryRecord>, now = Date.now()): MemoryRecord[] {
  return Object.values(memories)
    .filter((m) => m.attempts > 0 && m.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

export function conceptToLessonMap(memories: Record<string, MemoryRecord>): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of Object.values(memories)) {
    if (getLesson(m.lessonId)) map.set(m.conceptId, m.lessonId);
  }
  return map;
}

/** Le niveau est-il entièrement terminé (condition d'accès à l'évaluation) ? */
export function isLevelComplete(
  trackId: TrackKey,
  level: CEFR,
  progress: Record<string, LessonProgressRecord>
): boolean {
  const block = TRACKS[trackId].levels.find((b) => b.level === level);
  if (!block) return false;
  const lessons = block.sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
  return lessons.length > 0 && lessons.every((l) => progress[l.id]?.status === 'completed');
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))} s`;
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0 ? `${h} h` : `${h} h ${rem}`;
}
