import { describe, expect, it } from 'vitest';
import { grade } from '@/engine/grading';
import { generateExercises } from '@/engine/generator';
import { allLessons, getLesson, lessonsOfTrack } from '@/content';
import { lessonAfter } from '@/state/selectors';
import { difficultyWindow, selectExercises } from '@/engine/selection';
import { isDue, masteryOf, newMemory, review } from '@/engine/srs';
import { dayKey, effectiveStreak, emptyStreak, registerActivity } from '@/engine/streak';
import { computeLessonXp, XP_RULES } from '@/engine/xp';
import { evaluateBadges } from '@/engine/badges';
import {
  computeResult,
  nextQuestion,
  startPlacement,
  submitAnswer,
  PLACEMENT_MAX_QUESTIONS,
} from '@/engine/placement';
import type { MCQExercise, TranslateExercise, WordOrderExercise } from '@/engine/types';

const lesson = getLesson('gen-a1-u5-l2')!;

describe('correction', () => {
  const mcq = generateExercises(lesson).find((e) => e.type === 'mcq') as MCQExercise;

  it('valide la bonne option et refuse les autres', () => {
    expect(grade(mcq, { kind: 'choice', index: mcq.answer }).correct).toBe(true);
    const wrong = (mcq.answer + 1) % mcq.options.length;
    const r = grade(mcq, { kind: 'choice', index: wrong });
    expect(r.correct).toBe(false);
    expect(r.expected).toBe(mcq.options[mcq.answer]);
    expect(r.explanation.length).toBeGreaterThan(0);
  });

  it('tolère une faute de frappe en traduction mais la signale', () => {
    const tr = generateExercises(lesson).find((e) => e.type === 'translate') as TranslateExercise;
    const target = tr.accepted[0];
    const typo = target.replace(/.$/, '') + 'x';
    const r = grade(tr, { kind: 'text', value: typo });
    expect(r.correct).toBe(true);
    expect(r.nearMiss).toBe(true);
    expect(grade(tr, { kind: 'text', value: 'complètement autre chose' }).correct).toBe(false);
  });

  it('ignore la ponctuation et la casse', () => {
    const tr = generateExercises(lesson).find((e) => e.type === 'translate') as TranslateExercise;
    const noisy = `  ${tr.accepted[0].toUpperCase()}!! `;
    expect(grade(tr, { kind: 'text', value: noisy }).correct).toBe(true);
  });

  it('corrige la remise en ordre des mots', () => {
    const wo = generateExercises(lesson).find((e) => e.type === 'wordOrder') as WordOrderExercise;
    expect(grade(wo, { kind: 'tokens', value: wo.answer.split(' ') }).correct).toBe(true);
    expect(grade(wo, { kind: 'tokens', value: [...wo.answer.split(' ')].reverse() }).correct).toBe(false);
  });

  it('compte une question passée comme une erreur', () => {
    expect(grade(mcq, { kind: 'skipped' }).correct).toBe(false);
  });
});

describe('répétition espacée', () => {
  it('rapproche la révision après un échec et l’espace après des réussites', () => {
    const t0 = Date.UTC(2026, 0, 1);
    let m = newMemory('present-simple', t0);
    m = review(m, 0, t0);
    expect(m.lapses).toBe(1);
    expect(m.dueAt - t0).toBeLessThan(3600_000);

    let ok = newMemory('present-simple', t0);
    ok = review(ok, 2, t0);
    ok = review(ok, 2, t0);
    ok = review(ok, 2, t0);
    expect(ok.interval).toBeGreaterThanOrEqual(3);
    expect(isDue(ok, t0)).toBe(false);
  });

  it('reflète la maîtrise dans le score', () => {
    const t0 = Date.now();
    let good = newMemory('c', t0);
    for (let i = 0; i < 4; i++) good = review(good, 2, t0);
    let bad = newMemory('c2', t0);
    for (let i = 0; i < 4; i++) bad = review(bad, i % 2 === 0 ? 0 : 2, t0);
    expect(masteryOf(good)).toBeGreaterThan(masteryOf(bad));
  });
});

describe('série quotidienne', () => {
  it('incrémente sur des jours consécutifs et repart de 1 après une coupure', () => {
    const d1 = new Date(2026, 4, 1);
    const d2 = new Date(2026, 4, 2);
    const d4 = new Date(2026, 4, 4);

    let s = registerActivity(emptyStreak(), d1);
    expect(s.current).toBe(1);
    s = registerActivity(s, d2);
    expect(s.current).toBe(2);
    expect(s.best).toBe(2);
    s = registerActivity(s, d4);
    expect(s.current).toBe(1);
    expect(s.best).toBe(2);
  });

  it('est idempotente dans la même journée', () => {
    const d = new Date(2026, 4, 10);
    const once = registerActivity(emptyStreak(), d);
    const twice = registerActivity(once, d);
    expect(twice).toBe(once);
    expect(twice.lastActiveDay).toBe(dayKey(d));
  });

  it('tombe à zéro après deux jours d’inactivité', () => {
    const s = registerActivity(emptyStreak(), new Date(2026, 4, 1));
    expect(effectiveStreak(s, new Date(2026, 4, 2))).toBe(1);
    expect(effectiveStreak(s, new Date(2026, 4, 5))).toBe(0);
  });
});

describe('XP', () => {
  it('récompense la leçon, la série de bonnes réponses et le sans-faute', () => {
    const { total, events } = computeLessonXp({ correct: 10, nearMiss: 0, total: 10, maxCombo: 10 });
    const reasons = events.map((e) => e.reason);
    expect(reasons).toContain('lesson_complete');
    expect(reasons).toContain('perfect_lesson');
    expect(reasons).toContain('combo');
    expect(total).toBeGreaterThan(XP_RULES.lessonComplete);
  });

  it('accorde moins d’XP à une réponse presque juste', () => {
    const clean = computeLessonXp({ correct: 5, nearMiss: 0, total: 5, maxCombo: 5 }).total;
    const typo = computeLessonXp({ correct: 5, nearMiss: 5, total: 5, maxCombo: 5 }).total;
    expect(typo).toBeLessThan(clean);
  });
});

describe('badges', () => {
  it('débloque les badges franchis, une seule fois', () => {
    const snap = {
      totalXp: 120,
      lessonsCompleted: 1,
      unitsCompleted: 0,
      exercisesCorrect: 12,
      wordsLearned: 10,
      streakCurrent: 1,
      levelsCompleted: [],
      assessmentsPassed: 0,
      perfectLessons: 0,
      lastActivityHour: 14,
    };
    const first = evaluateBadges(snap, []);
    expect(first).toContain('first-lesson');
    expect(first).toContain('xp-100');
    expect(evaluateBadges(snap, first)).toEqual([]);
  });
});

describe('sélection des exercices', () => {
  it('reste dans la fenêtre de difficulté du niveau', () => {
    const [min, max] = difficultyWindow('A1');
    expect(min).toBeLessThanOrEqual(1);
    expect(max).toBeLessThan(5);
    const [minC1] = difficultyWindow('C1');
    expect(minC1).toBeGreaterThan(min);
  });

  it('sert une session de la taille demandée sans répéter le même item', () => {
    const ex = selectExercises({
      lesson,
      memories: new Map(),
      learnerLevel: 'A1',
      speechAvailable: false,
      seed: 7,
    });
    expect(ex.length).toBe(lesson.targetExercises);
    expect(ex.every((e) => e.type !== 'speak')).toBe(true);
    const items = ex.map((e) => e.itemId);
    expect(new Set(items).size).toBe(items.length);
  });

  it('priorise les notions échouées', () => {
    const all = generateExercises(lesson);
    const weakConcept = all[all.length - 1].conceptId;
    const memories = new Map([
      [
        weakConcept,
        { ...newMemory(weakConcept), attempts: 6, correct: 1, lapses: 3, dueAt: Date.now() - 1000 },
      ],
    ]);
    const ex = selectExercises({
      lesson,
      memories,
      learnerLevel: 'A1',
      speechAvailable: false,
      seed: 3,
      count: 5,
    });
    expect(ex.some((e) => e.conceptId === weakConcept)).toBe(true);
  });
});

describe('test de placement', () => {
  it('monte en difficulté quand tout est juste et rend un niveau élevé', () => {
    let state = startPlacement();
    let q = nextQuestion(state);
    let guard = 0;
    while (q && guard++ < 30) {
      state = submitAnswer(state, q, q.answer);
      q = nextQuestion(state);
    }
    const result = computeResult(state);
    expect(state.answers.length).toBeLessThanOrEqual(PLACEMENT_MAX_QUESTIONS);
    expect(['B1', 'B2', 'C1']).toContain(result.level);
    expect(result.scorePercent).toBe(100);
    expect(Object.keys(result.bySkill).length).toBeGreaterThan(1);
  });

  it('rend A1 quand tout est faux', () => {
    let state = startPlacement();
    let q = nextQuestion(state);
    let guard = 0;
    while (q && guard++ < 30) {
      const wrong = (q.answer + 1) % q.options.length;
      state = submitAnswer(state, q, wrong);
      q = nextQuestion(state);
    }
    const result = computeResult(state);
    expect(result.level).toBe('A1');
    expect(result.scorePercent).toBe(0);
  });

  it('ne repose jamais deux fois la même question', () => {
    let state = startPlacement();
    let q = nextQuestion(state);
    let guard = 0;
    while (q && guard++ < 30) {
      state = submitAnswer(state, q, q.answer);
      q = nextQuestion(state);
    }
    expect(new Set(state.askedIds).size).toBe(state.askedIds.length);
  });
});

describe('enchaînement des leçons', () => {
  const lessons = lessonsOfTrack('general');

  it('désigne la leçon suivante dans l’ordre du parcours', () => {
    expect(lessonAfter('general', lessons[0].id)?.id).toBe(lessons[1].id);
    expect(lessonAfter('general', lessons[3].id)?.id).toBe(lessons[4].id);
  });

  it('ne se désigne jamais elle-même', () => {
    // C'est précisément le défaut corrigé : la destination de « Continuer »
    // était calculée avant l'enregistrement de la leçon, si bien que la leçon
    // en cours se renvoyait à elle-même et le bouton retombait sur
    // « retour au parcours » au lieu d'enchaîner.
    for (const l of lessons) {
      expect(lessonAfter('general', l.id)?.id).not.toBe(l.id);
    }
  });

  it('ne dépend pas de la progression : le résultat est le même avant et après', () => {
    const before = lessonAfter('general', lessons[2].id);
    const after = lessonAfter('general', lessons[2].id);
    expect(before?.id).toBe(after?.id);
  });

  it('renvoie null sur la dernière leçon, ce qui ramène au parcours', () => {
    expect(lessonAfter('general', lessons[lessons.length - 1].id)).toBeNull();
  });

  it('renvoie null pour une leçon absente du parcours', () => {
    expect(lessonAfter('general', 'lecon-inexistante')).toBeNull();
    // Une leçon d'un autre parcours n'appartient pas à celui-ci.
    expect(lessonAfter('general', lessonsOfTrack('business')[0].id)).toBeNull();
  });
});

describe('libellés montrés à l’apprenant', () => {
  // Garde-fou né d'un vrai défaut : l'écran de fin de leçon affichait
  // « age-with-be · gen-a1-u1-l3-s2 », c'est-à-dire des identifiants internes.
  // Un identifiant n'a jamais rien à faire à l'écran : tout ce qui s'affiche
  // passe désormais par `concept`, et seulement par lui.
  const looksTechnical = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)+$/.test(s.trim());

  it('aucune notion affichable ne ressemble à un identifiant', () => {
    for (const l of allLessons()) {
      for (const ex of generateExercises(l)) {
        if (ex.concept === undefined) continue;
        expect(ex.concept.trim().length).toBeGreaterThan(0);
        expect(looksTechnical(ex.concept), `${l.id} → ${ex.id} : « ${ex.concept} »`).toBe(false);
      }
    }
  });

  it('chaque point de grammaire porte son titre, pas son topicId', () => {
    // Sans ça la carte « Grammaire » se vide, ce qui est une régression muette.
    const named = allLessons()
      .flatMap((l) => generateExercises(l))
      .filter((ex) => ex.skill === 'grammar' && ex.concept !== undefined);
    expect(named.length).toBeGreaterThan(0);
    // Un titre est un libellé humain — « be going to », « Comparer » — jamais
    // l'identifiant de la notion.
    expect(named.every((ex) => ex.concept !== ex.conceptId)).toBe(true);
  });
});
