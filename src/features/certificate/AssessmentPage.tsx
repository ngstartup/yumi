import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { Card, Chip } from '@/ds';
import { Fox } from '@/mascot';
import { CEFR_ORDER, TRACKS, type CEFR, type SkillKey, type TrackKey } from '@/content';
import { generateExercises } from '@/engine/generator';
import { hashString, makeRng, shuffle } from '@/lib/random';
import { recognitionAvailable } from '@/lib/tts';
import { feedback } from '@/lib/feedback';
import { useApp, type SessionOutcome } from '@/state/store';
import { SessionPlayer } from '@/features/lesson/SessionPlayer';

const PASS_MARK = 70;
const QUESTION_COUNT = 12;

export function AssessmentPage() {
  const t = useT();
  const navigate = useNavigate();
  const { trackId, level } = useParams();
  const issueCertificate = useApp((s) => s.issueCertificate);
  const [issuing, setIssuing] = useState(false);

  const valid =
    trackId !== undefined &&
    level !== undefined &&
    trackId in TRACKS &&
    (CEFR_ORDER as string[]).includes(level);

  const exercises = useMemo(() => {
    if (!valid) return [];
    const block = TRACKS[trackId as TrackKey].levels.find((b) => b.level === level);
    if (!block) return [];
    const lessons = block.sections.flatMap((s) => s.units.flatMap((u) => u.lessons));
    const rng = makeRng(hashString(`${trackId}-${level}-assessment`));
    const pool = lessons.flatMap((l) => generateExercises(l, hashString(l.id + 'exam')));
    const usable = pool.filter((e) => (recognitionAvailable() || e.type !== 'speak') && e.type !== 'match');
    // Une question par notion au maximum, pour couvrir tout le niveau.
    const seen = new Set<string>();
    const spread = shuffle(usable, rng).filter((e) => {
      if (seen.has(e.conceptId)) return false;
      seen.add(e.conceptId);
      return true;
    });
    return spread.slice(0, QUESTION_COUNT);
  }, [trackId, level, valid]);

  if (!valid) return <Navigate to="/app/learn" replace />;

  async function onFinished(_summary: unknown, outcomes: SessionOutcome[]) {
    if (issuing) return;
    const total = outcomes.length;
    const correct = outcomes.filter((o) => o.correct).length;
    const score = total === 0 ? 0 : Math.round((correct / total) * 100);
    if (score < PASS_MARK) return;

    const skillScores: Partial<Record<SkillKey, number>> = {};
    const skills = [...new Set(outcomes.map((o) => o.exercise.skill))];
    for (const s of skills) {
      const rows = outcomes.filter((o) => o.exercise.skill === s);
      skillScores[s] = Math.round((rows.filter((r) => r.correct).length / rows.length) * 100);
    }

    setIssuing(true);
    window.setTimeout(() => feedback('levelUp'), 1200);
    const cert = await issueCertificate({
      trackId: trackId as TrackKey,
      level: level as CEFR,
      overallScore: score,
      skillScores,
    });
    // Laisse l'écran de fin visible un instant avant le certificat.
    window.setTimeout(() => navigate(`/app/certificate/${cert.id}`, { replace: true }), 2500);
  }

  return (
    <SessionPlayer
      exercises={exercises}
      lessonId={`assessment-${trackId}-${level}`}
      title={t('learn.assessment')}
      subtitle={level}
      isAssessment
      exitTo="/app/learn"
      continueTo="/app/progress"
      onFinished={onFinished}
      intro={
        <div>
          <div className="flex items-center gap-4">
            <Fox size={88} expression="motivated" stage={CEFR_ORDER.indexOf(level as CEFR) + 1} animate />
            <div>
              <Chip tone="sun">
                {level} · {QUESTION_COUNT} questions
              </Chip>
              <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
                {t('certificate.unlockTitle')}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">{t('certificate.passMark', { n: PASS_MARK })}</p>
            </div>
          </div>
          <Card className="mt-6">
            <p className="text-[15px] leading-relaxed text-ink">
              Cette évaluation reprend l’ensemble des notions du niveau {level} : vocabulaire, grammaire,
              compréhension écrite et orale. En cas de réussite, votre certificat Yumi est délivré
              immédiatement avec le détail par compétence.
            </p>
          </Card>
        </div>
      }
    />
  );
}
