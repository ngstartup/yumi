import { Link, Navigate, useParams } from 'react-router-dom';
import { useI18n, useT } from '@/i18n';
import { Button, Card } from '@/ds';
import { IconChevronLeft } from '@/ds/icons';
import { Fox } from '@/mascot';
import { LEVEL_TO_STAGE } from '@/mascot/expressions';
import { useApp } from '@/state/store';
import { TRACK_META } from '@/content';

export function CertificatePage() {
  const t = useT();
  const { dict } = useI18n();
  const { certificateId = '' } = useParams();
  const certificates = useApp((s) => s.certificates);
  const cert = certificates.find((c) => c.id === certificateId);

  if (!cert) return <Navigate to="/app/progress" replace />;
  const stage = LEVEL_TO_STAGE[cert.level] ?? 1;

  return (
    <div className="space-y-5">
      <Link
        to="/app/progress"
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-blue-600 print:hidden"
      >
        <IconChevronLeft width={16} height={16} /> {t('stats.title')}
      </Link>

      {/* Le certificat lui-même — mise en page pensée pour l'impression / PDF. */}
      <article className="overflow-hidden rounded-xl3 bg-white shadow-lift ring-1 ring-surface-sunk print:shadow-none print:ring-0">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-8 text-center text-white">
          <div className="flex justify-center">
            <Fox size={72} stage={stage} expression="victory" />
          </div>
          <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.35em] text-blue-100">
            {t('certificate.heading')}
          </p>
        </div>

        <div className="px-8 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('certificate.awardedTo')}
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">{cert.fullName}</p>

          <div className="mt-7 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {t('certificate.englishLevel')}
              </p>
              <p className="font-display text-4xl font-extrabold text-blue-600">{cert.level}</p>
              <p className="text-xs text-ink-muted">{dict.levels[cert.level]}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {t('certificate.overallScore')}
              </p>
              <p className="font-display text-4xl font-extrabold text-sun-600">
                {Math.round(cert.overallScore)} %
              </p>
              <p className="text-xs text-ink-muted">{TRACK_META[cert.trackId].name}</p>
            </div>
          </div>

          <dl className="mx-auto mt-8 max-w-sm space-y-2 text-left">
            {Object.entries(cert.skillScores).map(([skill, value]) => (
              <div key={skill} className="flex items-center justify-between border-b border-surface-sunk pb-1.5">
                <dt className="text-sm text-ink-soft">
                  {dict.stats.skills[skill as keyof typeof dict.stats.skills]}
                </dt>
                <dd className="text-sm font-semibold tabular-nums text-ink">{value} %</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col items-center gap-1 text-xs text-ink-muted">
            <p>
              {t('certificate.issued')} {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
            </p>
            <p className="font-mono tracking-wider text-ink-soft">
              {t('certificate.id')} : {cert.id}
            </p>
          </div>
        </div>
      </article>

      <Card className="print:hidden">
        <p className="text-sm text-ink-muted">
          Ce certificat interne atteste de votre score dans Yumi. L’export PDF signé arrive dans une prochaine
          version — en attendant, l’impression du navigateur produit un document propre.
        </p>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => window.print()}>
            {t('certificate.print')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
