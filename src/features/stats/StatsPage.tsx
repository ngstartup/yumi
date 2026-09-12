import { Link } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import { Card, Chip, EmptyState, ProgressBar, SectionTitle, SkillBar, StatTile } from '@/ds';
import { IconBolt, IconCertificate, IconClock, IconTarget } from '@/ds/icons';
import { Fox } from '@/mascot';
import { LEVEL_TO_STAGE, STAGE_NAMES } from '@/mascot/expressions';
import { BADGES } from '@/engine/badges';
import { useApp } from '@/state/store';
import { formatDuration, skillMastery, successRate, totalWeekXp, weeklyXp } from '@/state/selectors';
import { SKILL_KEYS } from '@/content';
import { YumiCard } from './YumiCard';
import { cn } from '@/lib/cn';

export function StatsPage() {
  const t = useT();
  const { dict } = useI18n();
  const profile = useApp((s) => s.profile);
  const totals = useApp((s) => s.totals);
  const memories = useApp((s) => s.memories);
  const history = useApp((s) => s.dailyHistory);
  const streak = useApp((s) => s.streak);
  const badges = useApp((s) => s.badges);
  const certificates = useApp((s) => s.certificates);

  if (!profile) return null;

  const mastery = skillMastery(memories);
  const week = weeklyXp(history);
  const maxWeek = Math.max(10, ...week.map((w) => w.xp));
  const hasData = totals.lessonsCompleted > 0;
  const stage = LEVEL_TO_STAGE[profile.level] ?? 1;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Fox size={68} stage={stage} expression="proud" />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t('stats.title')}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{STAGE_NAMES[stage]}</p>
        </div>
      </header>

      {!hasData && (
        <EmptyState
          title={t('stats.noData')}
          action={
            <Link to="/app/learn" className="font-semibold text-blue-600 hover:underline">
              {t('learn.title')}
            </Link>
          }
        />
      )}

      <YumiCard level={profile.level} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label={t('stats.totalXp')} value={totals.xp} icon={<IconBolt width={14} height={14} />} tone="sun" />
        <StatTile label={t('stats.weekXp')} value={totalWeekXp(history)} icon={<IconBolt width={14} height={14} />} />
        <StatTile label={t('stats.lessonsDone')} value={totals.lessonsCompleted} icon={<IconTarget width={14} height={14} />} />
        <StatTile
          label={t('stats.timeLearning')}
          value={formatDuration(totals.timeMs)}
          icon={<IconClock width={14} height={14} />}
          tone="neutral"
        />
        <StatTile label={t('stats.wordsLearned')} value={totals.wordsLearned} />
        <StatTile label={t('stats.successRate')} value={`${successRate(history)} %`} tone="mint" />
        <StatTile label={t('stats.currentStreak')} value={`🔥 ${streak.current}`} sub={t('dashboard.bestStreak', { n: streak.best })} tone="sun" />
        <StatTile label={t('stats.currentLevel')} value={profile.level} sub={dict.levels[profile.level]} />
      </div>

      <section>
        <SectionTitle>{t('stats.last7')}</SectionTitle>
        <Card>
          <div className="flex h-32 items-end gap-2" role="img" aria-label="XP des sept derniers jours">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold tabular-nums text-ink-muted">{d.xp || ''}</span>
                <div
                  className={cn('w-full rounded-t-md transition-all', d.xp > 0 ? 'bg-blue-500' : 'bg-surface-sunk')}
                  style={{ height: `${Math.max(4, (d.xp / maxWeek) * 100)}%` }}
                  title={`${d.day} — ${d.xp} XP`}
                />
                <span className="text-[10px] text-ink-muted">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle>{t('stats.bySkill')}</SectionTitle>
        <Card className="space-y-3">
          {SKILL_KEYS.map((s) => (
            <SkillBar key={s} label={dict.stats.skills[s]} value={mastery[s]} />
          ))}
        </Card>
      </section>

      <section>
        <SectionTitle action={<Chip tone="sun">{t('stats.badgesEarned', { n: badges.length })}</Chip>}>
          {t('stats.badges')}
        </SectionTitle>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const owned = badges.includes(b.id);
            const label = dict.badges[b.i18nKey as keyof typeof dict.badges];
            return (
              <li
                key={b.id}
                className={cn(
                  'rounded-xl2 p-4 text-center ring-1',
                  owned ? 'bg-white shadow-card ring-surface-sunk' : 'bg-surface-sunk/50 ring-transparent'
                )}
              >
                <span className={cn('text-2xl', !owned && 'opacity-30 grayscale')} aria-hidden>
                  {b.emoji}
                </span>
                <p className={cn('mt-1 text-sm font-semibold', owned ? 'text-ink' : 'text-ink-muted')}>
                  {label?.name ?? b.id}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{label?.desc ?? ''}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>{t('stats.certificates')}</SectionTitle>
        {certificates.length === 0 ? (
          <EmptyState title={t('stats.noCertificates')} illustration={<IconCertificate className="text-ink-muted" width={28} height={28} />} />
        ) : (
          <ul className="space-y-2.5">
            {certificates.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/app/certificate/${c.id}`}
                  className="flex items-center gap-3 rounded-xl2 bg-white p-4 shadow-card ring-1 ring-surface-sunk transition hover:ring-blue-300"
                >
                  <IconCertificate className="text-sun-600" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {c.level} — {Math.round(c.overallScore)} %
                    </p>
                    <p className="truncate text-xs text-ink-muted">{c.id}</p>
                  </div>
                  <ProgressBar value={c.overallScore} className="w-20" size="sm" tone="mint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
