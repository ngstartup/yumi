import { Link } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  ProgressBar,
  RingProgress,
  SectionTitle,
  StatGroup,
  StatTile,
} from '@/ds';
import { IconBolt, IconChevronRight, IconClock, IconRefresh, IconTarget } from '@/ds/icons';
import { Fox } from '@/mascot';
import { LEVEL_TO_STAGE, STAGE_NAMES } from '@/mascot/expressions';
import { useApp } from '@/state/store';
import { TRACK_META, getUnit } from '@/content';
import { dueForReview, formatDuration, nextLesson, totalWeekXp, trackCompletion, weeklyXp } from '@/state/selectors';
import { goalXp } from '@/engine/xp';
import { NATIVE_VERSION } from '@/native';

export function DashboardPage() {
  const t = useT();
  const { dict } = useI18n();
  const profile = useApp((s) => s.profile);
  const progress = useApp((s) => s.lessonProgress);
  const memories = useApp((s) => s.memories);
  const daily = useApp((s) => s.daily);
  const streak = useApp((s) => s.streak);
  const totals = useApp((s) => s.totals);
  const history = useApp((s) => s.dailyHistory);

  if (!profile) return null;

  const trackId = profile.activeTrack;
  const target = goalXp(profile.dailyGoal);
  const todayXp = daily?.xp ?? 0;
  const goalPct = Math.min(100, Math.round((todayXp / target) * 100));
  const upcoming = nextLesson(trackId, profile.level, progress);
  const completion = trackCompletion(trackId, progress);
  const due = dueForReview(memories);
  const week = weeklyXp(history);
  const maxWeek = Math.max(10, ...week.map((w) => w.xp));
  const stage = LEVEL_TO_STAGE[profile.level] ?? 1;
  const isFirstLesson = totals.lessonsCompleted === 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="flex items-center gap-4">
        <Fox size={72} stage={stage} expression={goalPct >= 100 ? 'celebrating' : 'happy'} animate />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {t('dashboard.hello', { name: profile.firstName })} 👋
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {STAGE_NAMES[stage]} · {profile.level} — {dict.levels[profile.level]}
          </p>
        </div>
      </header>

      {/* Objectif du jour */}
      <Card className="flex items-center gap-5">
        <RingProgress value={goalPct} size={78} tone={goalPct >= 100 ? '#10B981' : '#2F62F0'}>
          <span className="font-display text-sm font-extrabold tabular-nums text-ink">{goalPct}%</span>
        </RingProgress>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('dashboard.dailyGoal')}
          </p>
          <p className="font-display text-xl font-bold tabular-nums text-ink">
            {todayXp} / {target} XP
          </p>
          {goalPct >= 100 ? (
            <Chip tone="mint" className="mt-1.5">
              {t('dashboard.goalReached')}
            </Chip>
          ) : (
            <ProgressBar value={todayXp} max={target} className="mt-2" />
          )}
        </div>
        <div className="hidden shrink-0 text-center sm:block">
          <p className="font-display text-2xl font-extrabold text-sun-600">🔥 {streak.current}</p>
          <p className="text-xs text-ink-muted">{t('dashboard.bestStreak', { n: streak.best })}</p>
        </div>
      </Card>

      {/* Continuer */}
      {upcoming ? (
        <Card className="yumi-brand-card text-white ring-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
            {isFirstLesson ? t('dashboard.startFirst') : t('dashboard.nextLesson')}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold">{upcoming.title}</h2>
          <p className="mt-1 text-sm text-blue-100">
            {getUnit(upcoming.unitId)?.title} · {upcoming.level} · {upcoming.estimatedMinutes} min
          </p>
          <p className="mt-3 text-sm leading-relaxed text-blue-50">{upcoming.objective}</p>
          <ButtonLink to={`/lesson/${upcoming.id}`} variant="sun" size="lg" className="mt-5">
            {t('dashboard.continueLabel')}
          </ButtonLink>
        </Card>
      ) : (
        <Card>
          <p className="font-display font-bold text-ink">{t('dashboard.trackDoneTitle')}</p>
          <p className="mt-1 text-sm text-ink-muted">{t('dashboard.trackDoneBody')}</p>
          <ButtonLink to="/app/learn" variant="secondary" className="mt-4">
            {t('learn.changeTrack')}
          </ButtonLink>
        </Card>
      )}

      {/* Révisions */}
      <Card className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun-50 text-sun-700">
          <IconRefresh />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-ink">{t('dashboard.reviewTitle')}</p>
          <p className="text-sm text-ink-muted">
            {due.length > 0 ? t('dashboard.reviewSub', { n: due.length }) : t('dashboard.noReview')}
          </p>
        </div>
        {due.length > 0 && (
          <ButtonLink to="/app/review" variant="secondary" size="sm">
            {t('dashboard.reviewCta')}
          </ButtonLink>
        )}
      </Card>

      {/* Progression générale */}
      <section>
        <SectionTitle
          action={
            <Link to="/app/learn" className="flex items-center gap-1 text-sm font-semibold text-blue-600">
              {t('learn.title')} <IconChevronRight width={16} height={16} />
            </Link>
          }
        >
          {t('dashboard.overallProgress')}
        </SectionTitle>
        <Card>
          <div className="flex items-baseline justify-between">
            <p className="font-display font-bold text-ink">
              {TRACK_META[trackId].icon} {TRACK_META[trackId].name}
            </p>
            <p className="text-sm font-semibold tabular-nums text-ink-soft">{completion.percent} %</p>
          </div>
          <ProgressBar value={completion.percent} className="mt-3" />
          <p className="mt-2 text-xs text-ink-muted">
            {completion.done} / {completion.total} {t('learn.lessons')}
          </p>
        </Card>
      </section>

      {/* Statistiques rapides */}
      <section>
        <SectionTitle>{t('dashboard.quickStats')}</SectionTitle>
        <StatGroup>
          <StatTile label={t('stats.weekXp')} value={totalWeekXp(history)} icon={<IconBolt width={14} height={14} />} tone="sun" />
          <StatTile label={t('stats.lessonsDone')} value={totals.lessonsCompleted} icon={<IconTarget width={14} height={14} />} />
          <StatTile label={t('stats.wordsLearned')} value={totals.wordsLearned} />
          <StatTile
            label={t('stats.timeLearning')}
            value={formatDuration(totals.timeMs)}
            icon={<IconClock width={14} height={14} />}
            tone="neutral"
          />
        </StatGroup>

        <Card className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t('stats.last7')}</p>
          <div className="mt-4 flex h-24 items-end gap-2" role="img" aria-label="XP des sept derniers jours">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={
                    d.xp > 0
                      ? 'w-full rounded-t-md bg-gradient-to-b from-blue-400 to-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_2px_5px_-2px_rgba(28,72,209,.7)]'
                      : 'w-full rounded-t-md bg-surface-sunk shadow-groove'
                  }
                  style={{ height: `${Math.max(4, (d.xp / maxWeek) * 100)}%` }}
                  title={`${d.day} — ${d.xp} XP`}
                />
                <span className="text-[10px] text-ink-muted">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Parcours actifs */}
      <section>
        <SectionTitle>{t('dashboard.activeTracks')}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(TRACK_META) as (keyof typeof TRACK_META)[]).map((key) => {
            const c = trackCompletion(key, progress);
            const active = key === trackId;
            return (
              <Card key={key} className={active ? 'ring-2 ring-blue-400' : undefined}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{TRACK_META[key].icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{TRACK_META[key].name}</p>
                    <p className="text-xs text-ink-muted">
                      {c.done}/{c.total} {t('learn.lessons')}
                    </p>
                  </div>
                  {active ? (
                    <Chip tone="blue">{t('dashboard.trackActive')}</Chip>
                  ) : (
                    <SwitchTrackButton trackKey={key} />
                  )}
                </div>
                <ProgressBar value={c.percent} size="sm" className="mt-3" tone={active ? 'blue' : 'sun'} />
              </Card>
            );
          })}
        </div>
      </section>

      {/* Version du code réellement exécuté. La constante est recompilée dans
          chaque paquet de mise à jour : elle change donc toute seule quand une
          nouvelle version descend sur le téléphone. */}
      <p className="pt-1 text-center text-xs tabular-nums text-ink-muted">
        {t('dashboard.versionLine', { v: NATIVE_VERSION })}
      </p>
    </div>
  );
}

function SwitchTrackButton({ trackKey }: { trackKey: keyof typeof TRACK_META }) {
  const t = useT();
  const updateProfile = useApp((s) => s.updateProfile);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => void updateProfile({ activeTrack: trackKey })}
      aria-label={t('dashboard.trackSwitchAria', { name: TRACK_META[trackKey].name })}
    >
      {t('dashboard.trackSwitch')}
    </Button>
  );
}
