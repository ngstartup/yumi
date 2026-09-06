import { Link, Navigate, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { Button, ButtonLink, Card, Chip, ProgressBar } from '@/ds';
import { IconCheck, IconChevronLeft, IconDownload, IconLock } from '@/ds/icons';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';
import { getUnit } from '@/content';
import { useApp } from '@/state/store';
import { lessonViews } from '@/state/selectors';
import { useToast } from '@/ds';

export function UnitPage() {
  const t = useT();
  const { unitId = '' } = useParams();
  const { push } = useToast();
  const progress = useApp((s) => s.lessonProgress);
  const offlineUnits = useApp((s) => s.offlineUnits);
  const toggleOffline = useApp((s) => s.toggleOfflineUnit);

  const unit = getUnit(unitId);
  if (!unit) return <Navigate to="/app/learn" replace />;

  const views = lessonViews(unit, progress);
  const done = views.filter((v) => v.status === 'completed').length;
  const downloaded = offlineUnits.includes(unit.id);

  async function onToggleOffline() {
    const now = await toggleOffline(unit!.id, unit!.trackId);
    push(now ? t('learn.downloaded') : 'Contenu retiré du hors connexion', now ? 'success' : 'info', now ? '📥' : '🗑️');
  }

  return (
    <div className="space-y-5">
      <Link
        to="/app/learn"
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-blue-600"
      >
        <IconChevronLeft width={16} height={16} /> {t('learn.title')}
      </Link>

      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl2 bg-blue-50 text-2xl" aria-hidden>
          {unit.icon}
        </span>
        <div className="min-w-0 flex-1">
          <Chip tone="neutral">
            {unit.level} · {t('learn.unit')}
          </Chip>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
            {unit.title}
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">{unit.subtitle}</p>
        </div>
      </header>

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-ink-soft">
            {done} / {unit.lessons.length} {t('learn.lessons')}
          </p>
          <p className="text-sm font-semibold tabular-nums text-ink-soft">
            {Math.round((done / unit.lessons.length) * 100)} %
          </p>
        </div>
        <ProgressBar value={done} max={unit.lessons.length} className="mt-3" />
        <Button
          variant={downloaded ? 'secondary' : 'ghost'}
          size="sm"
          className="mt-4"
          icon={downloaded ? <IconCheck width={16} height={16} /> : <IconDownload width={16} height={16} />}
          onClick={() => void onToggleOffline()}
        >
          {downloaded ? t('learn.downloaded') : t('learn.downloadOffline')}
        </Button>
      </Card>

      <ol className="space-y-2.5">
        {views.map((v, i) => {
          const locked = v.status === 'locked';
          const inner = (
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold',
                  v.status === 'completed'
                    ? 'bg-mint-500 text-white'
                    : locked
                      ? 'bg-surface-sunk text-ink-muted'
                      : 'bg-blue-500 text-white'
                )}
                aria-hidden
              >
                {v.status === 'completed' ? <IconCheck width={18} height={18} /> : locked ? <IconLock width={16} height={16} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('truncate font-semibold', locked ? 'text-ink-muted' : 'text-ink')}>
                  {v.lesson.title}
                </p>
                <p className="truncate text-sm text-ink-muted">{v.lesson.objective}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-ink-muted">{v.lesson.estimatedMinutes} min</p>
                {v.status === 'completed' && (
                  <p className="text-xs font-semibold tabular-nums text-mint-600">{v.bestAccuracy} %</p>
                )}
              </div>
            </div>
          );

          return (
            <li key={v.lesson.id}>
              {locked ? (
                <div className="rounded-xl2 bg-white p-4 opacity-70 ring-1 ring-surface-sunk" title={t('learn.lockedHint')}>
                  {inner}
                </div>
              ) : (
                <Link
                  to={`/lesson/${v.lesson.id}`}
                  onClick={() => feedback('navigate')}
                  className="block rounded-xl2 bg-white p-4 shadow-card ring-1 ring-surface-sunk transition hover:ring-blue-300"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {views.some((v) => v.status !== 'completed') && (
        <ButtonLink
          to={`/lesson/${(views.find((v) => v.status === 'available') ?? views[0]).lesson.id}`}
          block
          size="lg"
        >
          {done > 0 ? t('dashboard.continueLabel') : t('common.start')}
        </ButtonLink>
      )}
    </div>
  );
}
