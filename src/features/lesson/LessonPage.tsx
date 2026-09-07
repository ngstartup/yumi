import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { Card, Chip } from '@/ds';
import { Fox } from '@/mascot';
import { getLesson, getUnit } from '@/content';
import { selectExercises } from '@/engine/selection';
import { recognitionAvailable } from '@/lib/tts';
import { useApp } from '@/state/store';
import { lessonAfter } from '@/state/selectors';
import { track } from '@/lib/analytics';
import { SessionPlayer } from './SessionPlayer';

export function LessonPage() {
  const t = useT();
  const { lessonId = '' } = useParams();
  const profile = useApp((s) => s.profile);
  const memories = useApp((s) => s.memories);

  const lesson = getLesson(lessonId);

  const exercises = useMemo(() => {
    if (!lesson || !profile) return [];
    track('lesson_started', { lessonId: lesson.id });
    return selectExercises({
      lesson,
      memories: new Map(Object.entries(memories)),
      learnerLevel: profile.level,
      speechAvailable: recognitionAvailable(),
    });
    // La sélection ne doit pas se rejouer à chaque réponse : on la fige pour la session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, profile?.level]);

  if (!lesson || !profile) return <Navigate to="/app/learn" replace />;

  const unit = getUnit(lesson.unitId);
  // La suite se lit dans l'ordre du parcours de la leçon en cours, pas dans le
  // parcours actif du profil : l'apprenant peut très bien travailler une leçon
  // d'un autre parcours, et « Continuer » doit rester la leçon d'après.
  const upcoming = lessonAfter(lesson.trackId, lesson.id);

  return (
    <SessionPlayer
      exercises={exercises}
      lessonId={lesson.id}
      title={unit?.title ?? lesson.title}
      subtitle={lesson.title}
      exitTo={`/app/learn/${lesson.unitId}`}
      continueTo={upcoming ? `/lesson/${upcoming.id}` : `/app/learn/${lesson.unitId}`}
      continueLabel={upcoming ? t('lesson.continueLearning') : t('lesson.backToPath')}
      intro={
        <div>
          <div className="flex items-center gap-4">
            <Fox size={84} expression="encouraging" animate />
            <div>
              <Chip tone="blue">
                {lesson.level} · {lesson.estimatedMinutes} min
              </Chip>
              <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
                {lesson.title}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">{lesson.objective}</p>
            </div>
          </div>

          <Card className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('lesson.explanation')}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{lesson.intro}</p>
          </Card>

          {lesson.note && (
            <Card className="mt-3 border-l-4 border-sun-400">
              <p className="font-display font-bold text-ink">{lesson.note.title}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{lesson.note.body}</p>
              {lesson.note.examples && (
                <ul className="mt-3 space-y-1.5">
                  {lesson.note.examples.map((ex) => (
                    <li key={ex.en} className="rounded-xl bg-surface-alt px-3 py-2 text-sm">
                      <span className="font-semibold text-ink">{ex.en}</span>
                      <span className="mx-1.5 text-ink-muted">—</span>
                      <span className="text-ink-muted">{ex.fr}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <p className="mt-4 text-center text-xs text-ink-muted">
            {exercises.length} {t('lesson.exercise').toLowerCase()}s · {lesson.skills.length} compétences
          </p>
        </div>
      }
    />
  );
}
