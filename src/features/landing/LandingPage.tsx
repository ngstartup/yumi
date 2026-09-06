import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useApp } from '@/state/store';
import { ButtonLink, Card, Chip } from '@/ds';
import { IconBolt, IconCheck, IconGlobe, IconTarget } from '@/ds/icons';
import { Fox } from '@/mascot';
import { TRACK_META, TRACK_KEYS, countVocabInTrack, lessonsOfTrack } from '@/content';

export function LandingPage() {
  const { dict, t } = useI18n();
  const authenticated = useApp((s) => s.status === 'authenticated');

  const totalLessons = TRACK_KEYS.reduce((n, k) => n + lessonsOfTrack(k).length, 0);
  const totalWords = TRACK_KEYS.reduce((n, k) => n + countVocabInTrack(k), 0);

  return (
    <div className="min-h-screen bg-surface">
      <a href="#main" className="yumi-skip-link">
        Aller au contenu
      </a>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <Fox size={38} expression="happy" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">Yumi</span>
        </div>
        <nav className="flex items-center gap-2">
          {authenticated ? (
            <ButtonLink to="/app" size="sm">
              Mon tableau de bord
            </ButtonLink>
          ) : (
            <>
              <Link
                to="/signin"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft hover:text-blue-600"
              >
                {t('auth.signIn')}
              </Link>
              <ButtonLink to="/signup" size="sm">
                {t('landing.ctaPrimary')}
              </ButtonLink>
            </>
          )}
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="yumi-grid-bg relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-2 lg:pb-24 lg:pt-14">
            <div>
              <Chip tone="sun">{t('landing.freeBadge')}</Chip>
              <h1 className="mt-4 whitespace-pre-line font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                {t('landing.heroTitle')}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{t('landing.heroSub')}</p>
              <p className="mt-2 font-display text-base font-bold uppercase tracking-[0.18em] text-blue-500">
                {t('landing.tagline')}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/signup" size="lg">
                  {t('landing.ctaPrimary')}
                </ButtonLink>
                <ButtonLink to="/signin" variant="secondary" size="lg">
                  {t('landing.ctaSecondary')}
                </ButtonLink>
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Leçons prêtes</dt>
                  <dd className="font-display text-xl font-bold text-ink">{totalLessons}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Mots et expressions</dt>
                  <dd className="font-display text-xl font-bold text-ink">{totalWords}+</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Niveaux CECRL</dt>
                  <dd className="font-display text-xl font-bold text-ink">A1 → C2</dd>
                </div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-100 via-sun-50 to-white blur-2xl" />
              <Card className="shadow-lift">
                <div className="flex items-center gap-3">
                  <Fox size={68} expression="encouraging" animate />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Leçon 3 · A1</p>
                    <p className="font-display text-lg font-bold text-ink">Present simple</p>
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold text-ink-soft">Choose the correct sentence.</p>
                <ul className="mt-3 space-y-2">
                  {[
                    { label: 'She work in Paris.', state: 'idle' },
                    { label: 'She works in Paris.', state: 'ok' },
                    { label: 'She working in Paris.', state: 'idle' },
                  ].map((o) => (
                    <li
                      key={o.label}
                      className={
                        o.state === 'ok'
                          ? 'flex items-center justify-between rounded-xl border-2 border-mint-500 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800'
                          : 'rounded-xl border-2 border-surface-sunk px-4 py-3 text-sm text-ink-soft'
                      }
                    >
                      {o.label}
                      {o.state === 'ok' && <IconCheck className="text-mint-600" />}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                  <strong className="font-semibold">Pourquoi&nbsp;: </strong>
                  avec «&nbsp;she&nbsp;», le verbe au présent simple prend «&nbsp;-s&nbsp;».
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Bénéfices */}
        <section className="border-t border-surface-sunk bg-surface-alt py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('landing.benefitsTitle')}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dict.landing.benefits.map((b, i) => (
                <Card key={b.title} className="h-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {[<IconTarget key="a" />, <IconBolt key="b" />, <IconCheck key="c" />, <IconGlobe key="d" />][i]}
                  </span>
                  <h3 className="mt-3 font-display font-bold text-ink">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{b.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fonctionnement */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('landing.howTitle')}
            </h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {dict.landing.how.map((h, i) => (
                <li key={h.title} className="relative pl-12">
                  <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-sun-400 font-display text-sm font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-bold text-ink">{h.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Parcours */}
        <section className="border-t border-surface-sunk bg-surface-alt py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t('landing.tracksTitle')}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRACK_KEYS.map((k) => {
                const meta = TRACK_META[k];
                return (
                  <Card key={k} className="h-full">
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="text-2xl">
                        {meta.icon}
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-ink">{meta.name}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {meta.tagline}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{meta.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
            <Fox size={96} expression="celebrating" animate />
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
              {t('landing.finalCta')}
            </h2>
            <p className="mt-2 max-w-lg text-ink-soft">{t('landing.finalCtaSub')}</p>
            <ButtonLink to="/signup" size="lg" className="mt-7">
              {t('landing.ctaPrimary')}
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-sunk py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center text-xs text-ink-muted sm:px-8">
          <div className="flex items-center gap-2">
            <Fox size={22} />
            <span className="font-display font-bold text-ink">Yumi</span>
          </div>
          <p>{t('landing.footerNote')}</p>
          <p>© {new Date().getFullYear()} Yumi — Learn English. Build your future.</p>
        </div>
      </footer>
    </div>
  );
}
