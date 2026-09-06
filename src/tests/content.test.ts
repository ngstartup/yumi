import { describe, expect, it } from 'vitest';
import { TRACKS, TRACK_KEYS, allLessons, getLesson, getUnit } from '@/content';
import { generateExercises } from '@/engine/generator';

describe('intégrité du contenu', () => {
  const lessons = allLessons();

  it('expose au moins 40 leçons réparties sur tous les parcours', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(40);
    for (const key of TRACK_KEYS) {
      expect(TRACKS[key].levels.length).toBeGreaterThan(0);
    }
  });

  it('n’a aucun identifiant de leçon en double', () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rattache chaque leçon à une unité existante', () => {
    for (const lesson of lessons) {
      expect(getUnit(lesson.unitId), `unité manquante pour ${lesson.id}`).toBeDefined();
      expect(getLesson(lesson.id)).toBe(lesson);
    }
  });

  it('place le mot à trouver dans la phrase de référence de chaque point de grammaire', () => {
    for (const lesson of lessons) {
      for (const item of lesson.items) {
        if (item.kind !== 'grammar' || !item.blank) continue;
        expect(
          item.reference.en.toLowerCase().includes(item.blank.toLowerCase()),
          `${item.id} : « ${item.blank} » absent de « ${item.reference.en} »`
        ).toBe(true);
      }
    }
  });

  it('fournit au moins trois formes fautives distinctes par point de grammaire', () => {
    for (const lesson of lessons) {
      for (const item of lesson.items) {
        if (item.kind !== 'grammar') continue;
        expect(new Set(item.wrong).size, item.id).toBeGreaterThanOrEqual(3);
        expect(item.wrong).not.toContain(item.reference.en);
      }
    }
  });

  it('pointe une bonne réponse valide dans chaque question de lecture', () => {
    for (const lesson of lessons) {
      for (const item of lesson.items) {
        if (item.kind !== 'reading') continue;
        for (const q of item.questions) {
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
          expect(new Set(q.options).size).toBe(q.options.length);
        }
      }
    }
  });

  it('génère assez d’exercices valides pour chaque leçon', () => {
    for (const lesson of lessons) {
      const exercises = generateExercises(lesson);
      expect(exercises.length, `${lesson.id} génère trop peu d'exercices`).toBeGreaterThanOrEqual(
        lesson.targetExercises
      );
      for (const e of exercises) {
        if (e.type === 'mcq' || e.type === 'listenChoose' || e.type === 'findError' || e.type === 'reading') {
          expect(e.answer, `${e.id} sans bonne réponse`).toBeGreaterThanOrEqual(0);
          expect(e.answer).toBeLessThan(e.options.length);
          expect(new Set(e.options).size, `${e.id} a des options en double`).toBe(e.options.length);
        }
        if (e.type === 'fillBlank') {
          expect(e.accepted[0].length).toBeGreaterThan(0);
          if (e.choices) {
            expect(
              e.choices.some((c) => c.toLowerCase() === e.accepted[0].toLowerCase()),
              `${e.id} : la bonne réponse n'est pas proposée`
            ).toBe(true);
          }
        }
        if (e.type === 'wordOrder') {
          expect(e.tokens.length).toBeGreaterThan(2);
        }
        expect(e.explanation.length, `${e.id} sans explication`).toBeGreaterThan(0);
      }
    }
  });

  it('produit des exercices déterministes pour une même graine', () => {
    const lesson = lessons[0];
    const a = generateExercises(lesson, 42).map((e) => e.id + JSON.stringify(e));
    const b = generateExercises(lesson, 42).map((e) => e.id + JSON.stringify(e));
    expect(a).toEqual(b);
  });
});
