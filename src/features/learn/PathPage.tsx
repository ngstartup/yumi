import { Link } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import { ButtonLink, Card, Chip, ProgressBar, SectionTitle } from '@/ds';
import { IconCertificate, IconCheck, IconLock } from '@/ds/icons';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';
import { TRACK_META, TRACK_KEYS, upcomingLevels, type TrackKey } from '@/content';
import { useApp } from '@/state/store';
import { buildPath, isLevelComplete, trackCompletion } from '@/state/selectors';

export function PathPage() {
  const t = useT();
  const { dict } = useI18n();
  const profile = useApp((s) => s.profile);
  const progress = useApp((s) => s.lessonProgress);
  const certificates = useApp((s) => s.certificates);
  const updateProfile = useApp((s) => s.updateProfile);

  if (!profile) return null;
  const trackId = profile.activeTrack;
  const path = buildPath(trackId, progress);
  const completion = trackCompletion(trackId, progress);
  const upcoming = upcomingLevels(trackId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t('learn.title')}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{t('learn.subtitle')}</p>
      </header>

      {/* Sélecteur de parcours */}
      <div className="yumi-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TRACK_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              feedback('select');
              void updateProfile({ activeTrack: key as TrackKey });
            }}
            aria-pressed={key === trackId}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl2 border-2 px-4 py-2.5 text-sm font-semibold transition-all',
              key === trackId
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-surface-sunk bg-white text-ink-muted hover:border-blue-200'
            )}
          >
            <span aria-hidden>{TRACK_META[key].icon}</span>
            {TRACK_META[key].name}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="font-display font-bold text-ink">{TRACK_META[trackId].name}</p>
          <p className="text-sm font-semibold tabular-nums text-ink-soft">{completion.percent} %</p>
        </div>
        <ProgressBar value={completion.percent} className="mt-3" />
        <p className="mt-2 text-xs text-ink-muted">{TRACK_META[trackId].description}</p>
      </Card>

      {/* Carte de progression */}
      {path.map((block) => {
        const levelDone = isLevelComplete(trackId, block.level, progress);
        const cert = certificates.find((c) => c.trackId === trackId && c.level === block.level);
        return (
          <section key={`${block.level}-${block.sectionTitle}`}>
            <SectionTitle
              action={
                <Chip tone={levelDone ? 'mint' : 'neutral'}>
                  {block.level} — {dict.levels[block.level]}
                </Chip>
              }
            >
              {block.sectionTitle}
            </SectionTitle>

            <ol className="space-y-2.5">
              {block.units.map((u) => {
                const locked = u.status === 'locked';
                const content = (
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl2 text-xl',
                        u.status === 'completed'
                          ? 'bg-mint-500 text-white'
                          : locked
                            ? 'bg-surface-sunk text-ink-muted'
                            : 'bg-blue-50'
                      )}
                      aria-hidden
                    >
                      {u.status === 'completed' ? <IconCheck /> : locked ? <IconLock /> : u.unit.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate font-display font-bold', locked ? 'text-ink-muted' : 'text-ink')}>
                        {u.unit.title}
                      </p>
                      <p className="truncate text-sm text-ink-muted">{u.unit.subtitle}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar
                          value={u.percent}
                          size="sm"
                          tone={u.status === 'completed' ? 'mint' : 'blue'}
                          className="flex-1"
                        />
                        <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                          {u.completedLessons}/{u.totalLessons}
                        </span>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <li key={u.unit.id}>
                    {locked ? (
                      <div
                        className="rounded-xl2 bg-white p-4 opacity-70 ring-1 ring-surface-sunk"
                        aria-label={`${u.unit.title} — ${t('learn.locked')}`}
                        title={t('learn.lockedHint')}
                      >
                        {content}
                      </div>
                    ) : (
                      <Link
                        to={`/app/learn/${u.unit.id}`}
                        onClick={() => feedback('navigate')}
                        className="block rounded-xl2 bg-white p-4 shadow-card ring-1 ring-surface-sunk transition hover:ring-blue-300"
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>

            {levelDone && (
              <Card className="mt-3 border-2 border-sun-200 bg-sun-50 ring-0">
                <div className="flex items-center gap-3">
                  <IconCertificate className="text-sun-700" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-ink">
                      {t('certificate.unlockTitle')} — {block.level}
                    </p>
                    <p className="text-sm text-ink-muted">{t('certificate.passMark', { n: 70 })}</p>
                  </div>
                  <ButtonLink
                    to={cert ? `/app/certificate/${cert.id}` : `/app/assessment/${trackId}/${block.level}`}
                    size="sm"
                    variant="sun"
                  >
                    {cert ? t('certificate.title') : t('certificate.startAssessment')}
                  </ButtonLink>
                </div>
              </Card>
            )}
          </section>
        );
      })}

      {upcoming.length > 0 && (
        <section>
          <SectionTitle>Prochainement</SectionTitle>
          <Card>
            <p className="text-sm text-ink-muted">
              Les niveaux suivants du référentiel CECRL sont prévus dans ce parcours et s’ajouteront sans
              modifier votre progression :
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {upcoming.map((l) => (
                <Chip key={l} tone="neutral">
                  {l} — {dict.levels[l]}
                </Chip>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
